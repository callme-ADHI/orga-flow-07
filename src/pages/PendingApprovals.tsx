import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { UserPlus, FileText, CheckCircle, XCircle } from "lucide-react";

interface PendingUser {
  id: string;
  user_id: string;
  name: string;
  email: string;
  resume_url: string | null;
  created_at: string;
}

export default function PendingApprovals() {
  const { profile } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRanks, setSelectedRanks] = useState<Record<string, string>>({});
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPendingUsers();
  }, [profile]);

  const fetchPendingUsers = async () => {
    if (!profile?.org_id) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("org_id", profile.org_id)
      .eq("approved", false)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load pending users");
      console.error(error);
    } else {
      setPendingUsers(data || []);
      // Initialize ranks to 'C' by default
      const initialRanks: Record<string, string> = {};
      const initialRoles: Record<string, string> = {};
      data?.forEach((user) => {
        initialRanks[user.id] = 'C';
        initialRoles[user.id] = 'Employee';
      });
      setSelectedRanks(initialRanks);
      setSelectedRoles(initialRoles);
    }
    setLoading(false);
  };

  const handleApprove = async (userId: string, profileId: string) => {
    const rank = selectedRanks[profileId];
    const role = selectedRoles[profileId];

    if (!rank) {
      toast.error("Please select a rank");
      return;
    }

    try {
      // Generate custom ID
      const { data: customIdData, error: idError } = await supabase
        .rpc("generate_custom_id", {
          role_type: role,
          org_uuid: profile?.org_id,
        });

      if (idError) throw idError;

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({
          approved: true,
          rank,
          role,
          custom_id: customIdData,
        })
        .eq("id", profileId);

      if (error) throw error;

      // Create notification for the approved user
      await supabase.from("notifications").insert({
        profile_id: profileId,
        title: "Welcome to the Organization!",
        message: `You have been approved as ${role} with rank ${rank}. Your ID is ${customIdData}`,
        type: "member_approved",
      });

      // Notify all CEO and Managers about the new member
      const { data: managers } = await supabase
        .from("profiles")
        .select("id")
        .eq("org_id", profile?.org_id)
        .in("role", ["CEO", "Manager"])
        .eq("approved", true);

      if (managers) {
        for (const manager of managers) {
          if (manager.id !== profile?.id) {
            await supabase.from("notifications").insert({
              profile_id: manager.id,
              title: "New Member Approved",
              message: `${pendingUsers.find(u => u.id === profileId)?.name} has been approved as ${role}`,
              type: "member_approved",
            });
          }
        }
      }

      toast.success("User approved successfully");
      fetchPendingUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve user");
      console.error(error);
    }
  };

  const handleReject = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", profileId);

      if (error) throw error;

      toast.success("User rejected");
      fetchPendingUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject user");
      console.error(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
            Pending Approvals
          </h1>
          <p className="text-muted-foreground">Review and approve new members</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading pending users...</p>
          </div>
        ) : pendingUsers.length === 0 ? (
          <Card className="bg-gradient-card border-border/50 p-12 text-center">
            <UserPlus className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Pending Approvals</h3>
            <p className="text-muted-foreground">All users have been processed</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingUsers.map((user) => (
              <Card key={user.id} className="bg-gradient-card border-border/50 p-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{user.name}</h3>
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                        Pending
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{user.email}</p>
                    
                    {user.resume_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mb-4"
                        onClick={() => window.open(user.resume_url!, "_blank")}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Resume
                      </Button>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">
                          Assign Role
                        </label>
                        <Select
                          value={selectedRoles[user.id]}
                          onValueChange={(value) =>
                            setSelectedRoles({ ...selectedRoles, [user.id]: value })
                          }
                        >
                          <SelectTrigger className="bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            <SelectItem value="Manager">Manager</SelectItem>
                            <SelectItem value="Employee">Employee</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">
                          Assign Rank
                        </label>
                        <Select
                          value={selectedRanks[user.id]}
                          onValueChange={(value) =>
                            setSelectedRanks({ ...selectedRanks, [user.id]: value })
                          }
                        >
                          <SelectTrigger className="bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            <SelectItem value="S">S - Highest</SelectItem>
                            <SelectItem value="A">A - High</SelectItem>
                            <SelectItem value="B">B - Above Average</SelectItem>
                            <SelectItem value="C">C - Average</SelectItem>
                            <SelectItem value="D">D - Below Average</SelectItem>
                            <SelectItem value="E">E - Lowest</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-success hover:bg-success/90"
                      onClick={() => handleApprove(user.user_id, user.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(user.id)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, FolderKanban, Loader2 } from "lucide-react";
import { useOrgData } from "@/hooks/useOrgData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Groups = () => {
  const { profile } = useAuth();
  const { groups, employees, loading, refreshData } = useOrgData();
  const [createLoading, setCreateLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    groupName: "",
    groupRank: "",
    leaderId: "",
  });

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !profile?.org_id) return;

    setCreateLoading(true);
    try {
      const { data: group, error } = await supabase
        .from("groups")
        .insert({
          group_name: formData.groupName,
          group_rank: formData.groupRank || null,
          leader_id: formData.leaderId || null,
          org_id: profile.org_id,
          created_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add leader as a member if selected
      if (formData.leaderId) {
        await supabase.from("group_members").insert({
          group_id: group.id,
          profile_id: formData.leaderId,
        });
      }

      toast.success("Group created successfully!");
      setDialogOpen(false);
      setFormData({ groupName: "", groupRank: "", leaderId: "" });
      refreshData();
    } catch (error: any) {
      toast.error(error.message || "Failed to create group");
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
              Groups
            </h1>
            <p className="text-muted-foreground">Manage team groups and assignments</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-gold text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <Label htmlFor="groupName">Group Name</Label>
                  <Input
                    id="groupName"
                    value={formData.groupName}
                    onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                    required
                    className="mt-1"
                    placeholder="Enter group name"
                  />
                </div>
                <div>
                  <Label htmlFor="groupRank">Group Rank (Optional)</Label>
                  <Select 
                    value={formData.groupRank} 
                    onValueChange={(value) => setFormData({ ...formData, groupRank: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select rank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="S">S - Highest</SelectItem>
                      <SelectItem value="A">A - High</SelectItem>
                      <SelectItem value="B">B - Above Average</SelectItem>
                      <SelectItem value="C">C - Average</SelectItem>
                      <SelectItem value="D">D - Below Average</SelectItem>
                      <SelectItem value="E">E - Lowest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="leader">Group Leader (Optional)</Label>
                  <Select 
                    value={formData.leaderId} 
                    onValueChange={(value) => setFormData({ ...formData, leaderId: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select leader" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} ({emp.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-gold text-primary-foreground"
                  disabled={createLoading}
                >
                  {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {createLoading ? "Creating..." : "Create Group"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {groups.length === 0 ? (
          <Card className="bg-gradient-card border-border/50 p-12 text-center">
            <FolderKanban className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Groups Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first group to organize your team</p>
            <Button className="bg-gradient-gold text-primary-foreground" onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Group
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map((group) => (
              <Card key={group.id} className="bg-gradient-card border-border/50 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{group.group_name}</h3>
                      <p className="text-sm text-muted-foreground">{group.member_count} members</p>
                    </div>
                  </div>
                  {group.group_rank && (
                    <Badge variant="outline">Rank {group.group_rank}</Badge>
                  )}
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Leader:</span>
                    <span className="font-medium">{group.leader_name}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Members
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit Group
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Groups;

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBannedUsers } from "@/hooks/useChat";
import { useOrgData } from "@/hooks/useOrgData";
import { useAuth } from "@/contexts/AuthContext";
import { Ban, UserX, ShieldOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BannedUsers = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { bannedUsers, loading, banUser, unbanUser } = useBannedUsers();
  const { employees } = useOrgData();
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [banReason, setBanReason] = useState("");
  const [processing, setProcessing] = useState(false);

  // Only CEO can access this page
  if (profile?.role !== "CEO") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Ban className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">Only CEO can manage banned users</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleBanUser = async () => {
    if (!selectedUser) return;

    setProcessing(true);
    const success = await banUser(selectedUser, banReason);
    setProcessing(false);

    if (success) {
      toast({
        title: "User Banned",
        description: "The user has been banned from the organization",
      });
      setBanDialogOpen(false);
      setSelectedUser("");
      setBanReason("");
    } else {
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive",
      });
    }
  };

  const handleUnbanUser = async (bannedId: string) => {
    setProcessing(true);
    const success = await unbanUser(bannedId);
    setProcessing(false);

    if (success) {
      toast({
        title: "User Unbanned",
        description: "The user can now rejoin the organization",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to unban user",
        variant: "destructive",
      });
    }
  };

  // Filter out CEO from bannable users
  const bannableUsers = employees.filter(e => e.role !== "CEO");

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
              Banned Users
            </h1>
            <p className="text-muted-foreground">
              Manage users who are banned from rejoining the organization
            </p>
          </div>
          <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Ban className="w-4 h-4 mr-2" />
                Ban User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ban User</DialogTitle>
                <DialogDescription>
                  Banning a user will remove them from the organization and prevent them from rejoining.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select User</label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user to ban" />
                    </SelectTrigger>
                    <SelectContent>
                      {bannableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.user_id}>
                          {user.name} ({user.role}) - {user.custom_id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reason (Optional)</label>
                  <Textarea
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="Enter reason for banning..."
                  />
                </div>
                <Button
                  onClick={handleBanUser}
                  disabled={!selectedUser || processing}
                  variant="destructive"
                  className="w-full"
                >
                  {processing ? "Processing..." : "Ban User"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {bannedUsers.length === 0 ? (
          <Card className="bg-gradient-card border-border/50 p-12 text-center">
            <ShieldOff className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Banned Users</h3>
            <p className="text-muted-foreground">
              There are no users currently banned from the organization
            </p>
          </Card>
        ) : (
          <Card className="bg-gradient-card border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Banned At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bannedUsers.map((banned) => (
                  <TableRow key={banned.id}>
                    <TableCell className="font-medium">{banned.user_name}</TableCell>
                    <TableCell>{banned.user_custom_id || "-"}</TableCell>
                    <TableCell>{banned.user_email}</TableCell>
                    <TableCell>{banned.reason || "-"}</TableCell>
                    <TableCell>
                      {new Date(banned.banned_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnbanUser(banned.id)}
                        disabled={processing}
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Unban
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BannedUsers;

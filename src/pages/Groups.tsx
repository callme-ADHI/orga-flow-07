import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, FolderKanban, Loader2, Eye, Pencil, UserPlus, X } from "lucide-react";
import { useOrgData } from "@/hooks/useOrgData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GroupMember {
  id: string;
  profile_id: string;
  name: string;
  email: string;
  role: string;
  rank: string | null;
}

const Groups = () => {
  const { profile } = useAuth();
  const { groups, employees, loading, refreshData } = useOrgData();
  const [createLoading, setCreateLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addMembersDialogOpen, setAddMembersDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    groupName: "",
    groupRank: "",
    leaderId: "",
  });

  const fetchGroupMembers = async (groupId: string) => {
    setMembersLoading(true);
    try {
      const { data, error } = await supabase
        .from("group_members")
        .select(`
          id,
          profile_id,
          profiles:profile_id (name, email, role, rank)
        `)
        .eq("group_id", groupId);

      if (error) throw error;

      const members = data?.map((m: any) => ({
        id: m.id,
        profile_id: m.profile_id,
        name: m.profiles?.name || "Unknown",
        email: m.profiles?.email || "",
        role: m.profiles?.role || "",
        rank: m.profiles?.rank,
      })) || [];

      setGroupMembers(members);
    } catch (error: any) {
      toast.error("Failed to load members");
    } finally {
      setMembersLoading(false);
    }
  };

  const handleViewMembers = async (group: any) => {
    setSelectedGroup(group);
    await fetchGroupMembers(group.id);
    setViewDialogOpen(true);
  };

  const handleEditGroup = (group: any) => {
    setSelectedGroup(group);
    setFormData({
      groupName: group.group_name,
      groupRank: group.group_rank || "",
      leaderId: group.leader_id || "",
    });
    setEditDialogOpen(true);
  };

  const handleAddMembersOpen = async (group: any) => {
    setSelectedGroup(group);
    await fetchGroupMembers(group.id);
    setSelectedEmployees([]);
    setAddMembersDialogOpen(true);
  };

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

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;

    setCreateLoading(true);
    try {
      const { error } = await supabase
        .from("groups")
        .update({
          group_name: formData.groupName,
          group_rank: formData.groupRank || null,
          leader_id: formData.leaderId || null,
        })
        .eq("id", selectedGroup.id);

      if (error) throw error;

      toast.success("Group updated successfully!");
      setEditDialogOpen(false);
      refreshData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update group");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAddMembers = async () => {
    if (!selectedGroup || selectedEmployees.length === 0) return;

    setCreateLoading(true);
    try {
      const membersToAdd = selectedEmployees.map(profileId => ({
        group_id: selectedGroup.id,
        profile_id: profileId,
      }));

      const { error } = await supabase
        .from("group_members")
        .insert(membersToAdd);

      if (error) throw error;

      toast.success("Members added successfully!");
      setAddMembersDialogOpen(false);
      setSelectedEmployees([]);
      refreshData();
    } catch (error: any) {
      toast.error(error.message || "Failed to add members");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      toast.success("Member removed!");
      setGroupMembers(groupMembers.filter(m => m.id !== memberId));
      refreshData();
    } catch (error: any) {
      toast.error("Failed to remove member");
    }
  };

  const existingMemberIds = groupMembers.map(m => m.profile_id);
  const availableEmployees = employees.filter(e => !existingMemberIds.includes(e.id));

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

        {/* View Members Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedGroup?.group_name} - Members</DialogTitle>
            </DialogHeader>
            {membersLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : groupMembers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No members in this group</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {groupMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role} {member.rank ? `(${member.rank})` : ""}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Group Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Edit Group</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateGroup} className="space-y-4">
              <div>
                <Label htmlFor="editGroupName">Group Name</Label>
                <Input
                  id="editGroupName"
                  value={formData.groupName}
                  onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Group Rank</Label>
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
                <Label>Group Leader</Label>
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
                Save Changes
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Members Dialog */}
        <Dialog open={addMembersDialogOpen} onOpenChange={setAddMembersDialogOpen}>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader>
              <DialogTitle>Add Members to {selectedGroup?.group_name}</DialogTitle>
            </DialogHeader>
            {availableEmployees.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">All employees are already members</p>
            ) : (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableEmployees.map((emp) => (
                    <div key={emp.id} className="flex items-center space-x-3 p-3 bg-background/50 rounded-lg">
                      <Checkbox
                        id={emp.id}
                        checked={selectedEmployees.includes(emp.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedEmployees([...selectedEmployees, emp.id]);
                          } else {
                            setSelectedEmployees(selectedEmployees.filter(id => id !== emp.id));
                          }
                        }}
                      />
                      <label htmlFor={emp.id} className="flex-1 cursor-pointer">
                        <p className="font-medium">{emp.name}</p>
                        <p className="text-sm text-muted-foreground">{emp.role} {emp.rank ? `(${emp.rank})` : ""}</p>
                      </label>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={handleAddMembers}
                  className="w-full bg-gradient-gold text-primary-foreground"
                  disabled={createLoading || selectedEmployees.length === 0}
                >
                  {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add {selectedEmployees.length} Member{selectedEmployees.length !== 1 ? "s" : ""}
                </Button>
              </>
            )}
          </DialogContent>
        </Dialog>

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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewMembers(group)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleAddMembersOpen(group)}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEditGroup(group)}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
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

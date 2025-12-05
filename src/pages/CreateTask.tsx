import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrgData } from "@/hooks/useOrgData";
import { Loader2 } from "lucide-react";

const CreateTask = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { employees, groups } = useOrgData();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "2",
    dueDate: "",
    assignmentType: "individual",
    assigneeId: "",
    groupId: "",
    assignedRank: "",
  });

  // Get unique ranks from employees
  const uniqueRanks = [...new Set(employees.filter(e => e.rank).map(e => e.rank))];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id || !profile?.org_id) {
      toast({
        title: "Error",
        description: "You must be logged in to create tasks",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create the task
      const { data: task, error: taskError } = await supabase
        .from("tasks")
        .insert({
          title: formData.title,
          description: formData.description || null,
          priority: parseInt(formData.priority),
          due_date: formData.dueDate,
          assignment_type: formData.assignmentType,
          assigned_rank: formData.assignmentType === "rank" ? formData.assignedRank : null,
          assigned_by: profile.id,
          org_id: profile.org_id,
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Create task assignment based on assignment type
      if (formData.assignmentType === "individual" && formData.assigneeId) {
        await supabase.from("task_assignments").insert({
          task_id: task.id,
          profile_id: formData.assigneeId,
        });

        // Create notification for assignee
        await supabase.from("notifications").insert({
          profile_id: formData.assigneeId,
          title: "New Task Assigned",
          message: `You have been assigned a new task: ${formData.title}`,
          type: "task_assigned",
        });
      } else if (formData.assignmentType === "group" && formData.groupId) {
        await supabase.from("task_assignments").insert({
          task_id: task.id,
          group_id: formData.groupId,
        });

        // Get group members and notify them
        const { data: members } = await supabase
          .from("group_members")
          .select("profile_id")
          .eq("group_id", formData.groupId);

        if (members) {
          for (const member of members) {
            await supabase.from("notifications").insert({
              profile_id: member.profile_id,
              title: "New Group Task",
              message: `A new task has been assigned to your group: ${formData.title}`,
              type: "task_assigned",
            });
          }
        }
      } else if (formData.assignmentType === "rank" && formData.assignedRank) {
        // Find all employees with the selected rank
        const employeesWithRank = employees.filter(e => e.rank === formData.assignedRank);
        
        for (const emp of employeesWithRank) {
          await supabase.from("task_assignments").insert({
            task_id: task.id,
            profile_id: emp.id,
          });

          await supabase.from("notifications").insert({
            profile_id: emp.id,
            title: "New Task for Your Rank",
            message: `A new task has been assigned to rank ${formData.assignedRank}: ${formData.title}`,
            type: "task_assigned",
          });
        }
      } else if (formData.assignmentType === "everyone") {
        // Assign to all employees in the organization
        const allEmployees = employees.filter(e => e.role === "Employee" && e.approved);
        
        for (const emp of allEmployees) {
          await supabase.from("task_assignments").insert({
            task_id: task.id,
            profile_id: emp.id,
          });

          await supabase.from("notifications").insert({
            profile_id: emp.id,
            title: "New Task Available",
            message: `A new task is available for everyone: ${formData.title}. First to complete wins!`,
            type: "task_assigned",
          });
        }
      }

      toast({
        title: "Task created successfully!",
        description: "The task has been assigned.",
      });
      navigate("/all-tasks");
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
            Create New Task
          </h1>
          <p className="text-muted-foreground">Assign tasks to team members or groups</p>
        </div>

        <Card className="bg-gradient-card border-border/50 p-8 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="mt-1"
                placeholder="Enter task title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1"
                placeholder="Enter task description"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">High</SelectItem>
                    <SelectItem value="2">Medium</SelectItem>
                    <SelectItem value="3">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                  className="mt-1"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="assignmentType">Assignment Type</Label>
              <Select 
                value={formData.assignmentType} 
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  assignmentType: value,
                  assigneeId: "",
                  groupId: "",
                  assignedRank: "",
                })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select assignment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                  <SelectItem value="rank">By Rank</SelectItem>
                  <SelectItem value="everyone">Everyone (First to Complete)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.assignmentType === "individual" && (
              <div>
                <Label htmlFor="assignee">Assign To</Label>
                <Select 
                  value={formData.assigneeId} 
                  onValueChange={(value) => setFormData({ ...formData, assigneeId: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.filter(e => e.role === "Employee").map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} {emp.rank ? `(${emp.rank})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.assignmentType === "group" && (
              <div>
                <Label htmlFor="group">Assign To Group</Label>
                <Select 
                  value={formData.groupId} 
                  onValueChange={(value) => setFormData({ ...formData, groupId: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.group_name} ({group.member_count} members)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.assignmentType === "rank" && (
              <div>
                <Label htmlFor="rank">Assign To Rank</Label>
                <Select 
                  value={formData.assignedRank} 
                  onValueChange={(value) => setFormData({ ...formData, assignedRank: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select rank" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueRanks.map((rank) => (
                      <SelectItem key={rank} value={rank!}>
                        Rank {rank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.assignmentType === "everyone" && (
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  This task will be assigned to all employees. The first person to complete it will be credited, and the task will be marked as done for everyone.
                </p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-gold text-primary-foreground"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateTask;

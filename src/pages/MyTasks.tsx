import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, ClipboardList, Loader2 } from "lucide-react";
import { useMyTasks } from "@/hooks/useOrgData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const MyTasks = () => {
  const { profile } = useAuth();
  const { tasks, loading, refreshTasks } = useMyTasks();
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);

  const getStatusColor = (status: string, dueDate: string) => {
    if (status === "completed") return "bg-success/10 text-success border-success/30";
    const isOverdue = new Date(dueDate) < new Date();
    if (isOverdue) return "bg-destructive/10 text-destructive border-destructive/30";
    if (status === "in_progress") return "bg-primary/10 text-primary border-primary/30";
    return "bg-muted text-muted-foreground border-border";
  };

  const getPriorityLabel = (priority: number) => {
    return priority === 1 ? "High" : priority === 2 ? "Medium" : "Low";
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    if (!profile?.id) return;

    setUpdatingTask(taskId);
    try {
      // Update task status
      const { error: taskError } = await supabase
        .from("tasks")
        .update({ 
          status: newStatus,
          completed_at: newStatus === "completed" ? new Date().toISOString() : null,
        })
        .eq("id", taskId);

      if (taskError) throw taskError;

      // Update assignment completion status
      if (newStatus === "completed") {
        await supabase
          .from("task_assignments")
          .update({ 
            is_completed: true,
            completed_by_profile_id: profile.id,
          })
          .eq("task_id", taskId)
          .eq("profile_id", profile.id);
      }

      toast.success(`Task marked as ${newStatus.replace("_", " ")}`);
      refreshTasks();
    } catch (error: any) {
      toast.error(error.message || "Failed to update task");
    } finally {
      setUpdatingTask(null);
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
            My Tasks
          </h1>
          <p className="text-muted-foreground">View and manage your assigned tasks</p>
        </div>

        {tasks.length === 0 ? (
          <Card className="bg-gradient-card border-border/50 p-12 text-center">
            <ClipboardList className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Tasks Assigned</h3>
            <p className="text-muted-foreground">You don't have any tasks assigned to you yet</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => {
              const isOverdue = new Date(task.due_date) < new Date() && task.status !== "completed";
              
              return (
                <Card key={task.id} className="bg-gradient-card border-border/50 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span className={isOverdue ? "text-destructive" : ""}>
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Priority: {getPriorityLabel(task.priority || 2)}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(task.status || "assigned", task.due_date)}>
                      {isOverdue && task.status !== "completed" ? "Overdue" : (task.status || "assigned").replace("_", " ")}
                    </Badge>
                  </div>

                  {task.status !== "completed" && (
                    <div className="flex gap-2">
                      {task.status === "assigned" && (
                        <Button 
                          size="sm" 
                          className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
                          onClick={() => handleUpdateStatus(task.id, "in_progress")}
                          disabled={updatingTask === task.id}
                        >
                          {updatingTask === task.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Start Working
                        </Button>
                      )}
                      {task.status === "in_progress" && (
                        <Button 
                          size="sm" 
                          className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                          onClick={() => handleUpdateStatus(task.id, "completed")}
                          disabled={updatingTask === task.id}
                        >
                          {updatingTask === task.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyTasks;

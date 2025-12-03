import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, Clock, CheckCircle2, AlertTriangle, FolderKanban } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMyTasks, useMyGroups } from "@/hooks/useOrgData";
import { useAuth } from "@/contexts/AuthContext";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { tasks, loading: tasksLoading } = useMyTasks();
  const { groups, loading: groupsLoading } = useMyGroups();

  const loading = tasksLoading || groupsLoading;

  // Calculate stats
  const activeTasks = tasks.filter(t => t.status !== "completed").length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const overdueTasks = tasks.filter(t => {
    const dueDate = new Date(t.due_date);
    return dueDate < new Date() && t.status !== "completed";
  }).length;

  const getStatusColor = (status: string, dueDate: string) => {
    if (status === "completed") return "text-success bg-success/10 border-success/30";
    const isOverdue = new Date(dueDate) < new Date();
    if (isOverdue) return "text-destructive bg-destructive/10 border-destructive/30";
    if (status === "in_progress") return "text-primary bg-primary/10 border-primary/30";
    return "text-foreground bg-muted border-border";
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
            Employee Dashboard
          </h1>
          <p className="text-muted-foreground">Welcome back, {profile?.name}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Tasks</p>
                <p className="text-3xl font-bold">{activeTasks}</p>
              </div>
              <ClipboardList className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completed</p>
                <p className="text-3xl font-bold text-success">{completedTasks}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
          </Card>

          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Overdue</p>
                <p className="text-3xl font-bold text-destructive">{overdueTasks}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </Card>

          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">My Groups</p>
                <p className="text-3xl font-bold">{groups.length}</p>
              </div>
              <FolderKanban className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Rank</p>
                <p className="text-3xl font-bold text-primary">{profile?.rank || "N/A"}</p>
              </div>
              <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">{profile?.rank?.charAt(0) || "?"}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Tasks List */}
        <Card className="bg-gradient-card border-border/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">My Tasks</h2>
            <Button variant="outline" size="sm" onClick={() => navigate("/my-tasks")}>
              View All
            </Button>
          </div>

          {tasks.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No tasks assigned to you yet</p>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-4 bg-background/30 rounded-lg hover:bg-background/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{task.title}</h3>
                      <Badge className={getStatusColor(task.status || "assigned", task.due_date)}>
                        {task.status || "assigned"}
                      </Badge>
                      <Badge variant="outline">
                        {task.priority === 1 ? "High" : task.priority === 2 ? "Medium" : "Low"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Button size="sm" className="bg-primary/10 hover:bg-primary/20 text-primary" onClick={() => navigate("/my-tasks")}>
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;

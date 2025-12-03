import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ClipboardList, FolderKanban, TrendingUp, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOrgData } from "@/hooks/useOrgData";
import { useAuth } from "@/contexts/AuthContext";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { stats, tasks, pendingUsers, loading } = useOrgData();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Recent tasks (last 5)
  const recentTasks = tasks.slice(0, 5);

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
            Manager Dashboard
          </h1>
          <p className="text-muted-foreground">Welcome back, {profile?.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Team Members</p>
                <p className="text-3xl font-bold">{stats.totalEmployees}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Tasks</p>
                <p className="text-3xl font-bold">{stats.activeTasks}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Groups</p>
                <p className="text-3xl font-bold">{stats.totalGroups}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FolderKanban className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card 
            className="bg-gradient-card border-border/50 p-6 cursor-pointer hover:border-warning/50 transition-colors"
            onClick={() => navigate("/pending-approvals")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Approvals</p>
                <p className="text-3xl font-bold text-warning">{stats.pendingApprovals}</p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-warning" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
                <p className="text-3xl font-bold text-success">{stats.completionRate}%</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-card border-border/50 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button onClick={() => navigate("/create-task")} className="bg-gradient-gold text-primary-foreground">
              Create New Task
            </Button>
            <Button onClick={() => navigate("/groups")} className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30">
              Manage Groups
            </Button>
            <Button onClick={() => navigate("/employees")} className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30">
              View Team Members
            </Button>
            <Button onClick={() => navigate("/pending-approvals")} className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30">
              Review Approvals
            </Button>
          </div>
        </Card>

        {/* Recent Tasks */}
        <Card className="bg-gradient-card border-border/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Tasks</h2>
            <Button variant="outline" size="sm" onClick={() => navigate("/all-tasks")}>
              View All
            </Button>
          </div>
          {recentTasks.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No tasks created yet</p>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-background/30 rounded-lg">
                  <div>
                    <p className="font-semibold">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Assigned to: {task.assignee_name} • Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    task.status === "completed" ? "bg-success/10 text-success" :
                    task.status === "in_progress" ? "bg-primary/10 text-primary" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {task.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;

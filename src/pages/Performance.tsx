import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMyTasks } from "@/hooks/useOrgData";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle2, Clock, AlertTriangle, TrendingUp } from "lucide-react";

const Performance = () => {
  const { profile } = useAuth();
  const { tasks, loading } = useMyTasks();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const overdueTasks = tasks.filter(t => new Date(t.due_date) < new Date() && t.status !== "completed").length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">My Performance</h1>
          <p className="text-muted-foreground">Track your task completion metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground mb-1">Total Tasks</p><p className="text-3xl font-bold">{totalTasks}</p></div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </Card>
          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground mb-1">Completed</p><p className="text-3xl font-bold text-success">{completedTasks}</p></div>
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
          </Card>
          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground mb-1">Overdue</p><p className="text-3xl font-bold text-destructive">{overdueTasks}</p></div>
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </Card>
          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground mb-1">Rank</p><p className="text-3xl font-bold text-primary">{profile?.rank || "N/A"}</p></div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </Card>
        </div>

        <Card className="bg-gradient-card border-border/50 p-6">
          <h3 className="text-lg font-semibold mb-4">Completion Rate</h3>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">{completedTasks} of {totalTasks} tasks completed</p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Performance;

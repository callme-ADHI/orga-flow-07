import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { useOrgData } from "@/hooks/useOrgData";
import { BarChart3, Users, ClipboardList, FolderKanban, TrendingUp } from "lucide-react";

const Analytics = () => {
  const { stats, employees, tasks, groups, loading } = useOrgData();

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
          <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">Analytics</h1>
          <p className="text-muted-foreground">Organization performance overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Members</p>
                <p className="text-3xl font-bold">{employees.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </Card>
          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Tasks</p>
                <p className="text-3xl font-bold">{tasks.length}</p>
              </div>
              <ClipboardList className="w-8 h-8 text-primary" />
            </div>
          </Card>
          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Groups</p>
                <p className="text-3xl font-bold">{groups.length}</p>
              </div>
              <FolderKanban className="w-8 h-8 text-primary" />
            </div>
          </Card>
          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
                <p className="text-3xl font-bold text-success">{stats.completionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-card border-border/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Task Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-muted-foreground">Active</span><span className="font-bold text-primary">{stats.activeTasks}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Completed</span><span className="font-bold text-success">{stats.completedTasks}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Pending Approvals</span><span className="font-bold text-warning">{stats.pendingApprovals}</span></div>
            </div>
          </Card>
          <Card className="bg-gradient-card border-border/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Team Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-muted-foreground">Managers</span><span className="font-bold">{stats.totalManagers}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Employees</span><span className="font-bold">{stats.totalEmployees}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Groups</span><span className="font-bold">{stats.totalGroups}</span></div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;

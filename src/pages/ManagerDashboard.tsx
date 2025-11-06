import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ClipboardList, FolderKanban, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ManagerDashboard = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
            Manager Dashboard
          </h1>
          <p className="text-muted-foreground">Team management and task assignment</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Team Members</p>
                <p className="text-3xl font-bold">12</p>
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
                <p className="text-3xl font-bold">48</p>
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
                <p className="text-3xl font-bold">5</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FolderKanban className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
                <p className="text-3xl font-bold text-success">89%</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => navigate("/create-task")} className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30">
              Create New Task
            </Button>
            <Button onClick={() => navigate("/groups")} className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30">
              Manage Groups
            </Button>
            <Button onClick={() => navigate("/employees")} className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30">
              View Team Members
            </Button>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gradient-card border-border/50 p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-background/30 rounded-lg">
                <div>
                  <p className="font-semibold">Task completed: Project Review</p>
                  <p className="text-sm text-muted-foreground">By John Doe - 2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;

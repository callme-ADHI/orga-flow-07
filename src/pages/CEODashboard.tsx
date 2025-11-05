import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ClipboardList, AlertCircle, TrendingUp } from "lucide-react";

const CEODashboard = () => {
  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
            CEO Dashboard
          </h1>
          <p className="text-muted-foreground">Organization overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Employees</p>
                <p className="text-3xl font-bold">24</p>
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
                <p className="text-3xl font-bold">142</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Approvals</p>
                <p className="text-3xl font-bold text-warning">3</p>
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
                <p className="text-3xl font-bold text-success">94%</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pending Approvals */}
          <Card className="lg:col-span-2 bg-gradient-card border-border/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Pending Approvals</h2>
            <div className="space-y-3">
              {[
                { name: "John Smith", role: "Employee", email: "john@example.com" },
                { name: "Sarah Johnson", role: "Manager", email: "sarah@example.com" },
                { name: "Mike Chen", role: "Employee", email: "mike@example.com" },
              ].map((person, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-background/30 rounded-lg">
                  <div>
                    <p className="font-semibold">{person.name}</p>
                    <p className="text-sm text-muted-foreground">{person.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-gradient-gold text-primary-foreground">
                      Approve
                    </Button>
                    <Button size="sm" variant="outline">
                      Deny
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gradient-card border-border/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30">
                View All Employees
              </Button>
              <Button className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30">
                Organization Settings
              </Button>
              <Button className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30">
                View Analytics
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CEODashboard;

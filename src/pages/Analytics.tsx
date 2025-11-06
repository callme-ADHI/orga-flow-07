import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

const Analytics = () => {
  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
            Analytics
          </h1>
          <p className="text-muted-foreground">Track performance and metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-muted-foreground">Task Completion Rate</h3>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <p className="text-3xl font-bold mb-1">94%</p>
            <p className="text-xs text-success">+5% from last month</p>
          </Card>

          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-muted-foreground">Average Task Duration</h3>
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <p className="text-3xl font-bold mb-1">3.2 days</p>
            <p className="text-xs text-muted-foreground">Stable this month</p>
          </Card>

          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-muted-foreground">Overdue Tasks</h3>
              <TrendingDown className="w-4 h-4 text-destructive" />
            </div>
            <p className="text-3xl font-bold mb-1">3</p>
            <p className="text-xs text-destructive">-2 from last week</p>
          </Card>
        </div>

        {/* Charts Placeholder */}
        <Card className="bg-gradient-card border-border/50 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Task Completion Trends</h2>
          <div className="h-64 flex items-center justify-center border border-border/50 rounded-lg">
            <p className="text-muted-foreground">Chart visualization coming soon</p>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-card border-border/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Top Performers</h2>
            <div className="space-y-3">
              {[
                { name: "John Smith", completed: 45, rate: 98 },
                { name: "Sarah Johnson", completed: 42, rate: 95 },
                { name: "Mike Chen", completed: 38, rate: 92 },
              ].map((performer, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                  <span className="font-medium">{performer.name}</span>
                  <div className="text-right">
                    <p className="font-semibold">{performer.completed} tasks</p>
                    <p className="text-xs text-success">{performer.rate}% rate</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-gradient-card border-border/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Task Distribution</h2>
            <div className="h-48 flex items-center justify-center border border-border/50 rounded-lg">
              <p className="text-muted-foreground">Pie chart coming soon</p>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { useOrgData } from "@/hooks/useOrgData";
import { BarChart3, Users, ClipboardList, FolderKanban, TrendingUp, PieChart, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, LineChart, Line, Legend, Area, AreaChart } from "recharts";

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

  // Prepare data for charts
  const taskStatusData = [
    { name: "Assigned", value: tasks.filter(t => t.status === "assigned").length, color: "hsl(var(--muted-foreground))" },
    { name: "In Progress", value: tasks.filter(t => t.status === "in_progress").length, color: "hsl(var(--primary))" },
    { name: "Completed", value: tasks.filter(t => t.status === "completed").length, color: "hsl(var(--success))" },
  ];

  const priorityData = [
    { name: "High", count: tasks.filter(t => t.priority === 1).length, color: "hsl(var(--destructive))" },
    { name: "Medium", count: tasks.filter(t => t.priority === 2).length, color: "hsl(var(--warning))" },
    { name: "Low", count: tasks.filter(t => t.priority === 3).length, color: "hsl(var(--muted-foreground))" },
  ];

  const roleDistribution = [
    { name: "CEO", value: employees.filter(e => e.role === "CEO").length, color: "hsl(38 42% 60%)" },
    { name: "Managers", value: employees.filter(e => e.role === "Manager").length, color: "hsl(38 60% 75%)" },
    { name: "Employees", value: employees.filter(e => e.role === "Employee").length, color: "hsl(var(--primary))" },
  ];

  // Calculate overdue tasks
  const overdueTasks = tasks.filter(t => {
    const dueDate = new Date(t.due_date);
    return dueDate < new Date() && t.status !== "completed";
  }).length;

  // Group tasks by week for trend chart
  const getWeekNumber = (date: Date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
  };

  const taskTrendData = (() => {
    const weekMap = new Map<string, { created: number; completed: number }>();
    const now = new Date();
    
    // Initialize last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const weekDate = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekKey = `Week ${getWeekNumber(weekDate)}`;
      weekMap.set(weekKey, { created: 0, completed: 0 });
    }

    tasks.forEach(task => {
      const createdDate = new Date(task.created_at || new Date());
      const weekKey = `Week ${getWeekNumber(createdDate)}`;
      if (weekMap.has(weekKey)) {
        const current = weekMap.get(weekKey)!;
        current.created++;
        if (task.status === "completed") {
          current.completed++;
        }
        weekMap.set(weekKey, current);
      }
    });

    return Array.from(weekMap.entries()).map(([name, data]) => ({
      name,
      created: data.created,
      completed: data.completed,
    }));
  })();

  const CHART_COLORS = ["hsl(38 42% 60%)", "hsl(142 76% 36%)", "hsl(0 0% 55%)"];

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">Analytics</h1>
          <p className="text-muted-foreground">Organization performance overview and insights</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gradient-card border-border/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Members</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
              <Users className="w-7 h-7 text-primary" />
            </div>
          </Card>
          <Card className="bg-gradient-card border-border/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Tasks</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
              <ClipboardList className="w-7 h-7 text-primary" />
            </div>
          </Card>
          <Card className="bg-gradient-card border-border/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Groups</p>
                <p className="text-2xl font-bold">{groups.length}</p>
              </div>
              <FolderKanban className="w-7 h-7 text-primary" />
            </div>
          </Card>
          <Card className="bg-gradient-card border-border/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Overdue</p>
                <p className="text-2xl font-bold text-destructive">{overdueTasks}</p>
              </div>
              <Activity className="w-7 h-7 text-destructive" />
            </div>
          </Card>
          <Card className="bg-gradient-card border-border/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Completion Rate</p>
                <p className="text-2xl font-bold text-success">{stats.completionRate}%</p>
              </div>
              <TrendingUp className="w-7 h-7 text-success" />
            </div>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Task Status Pie Chart */}
          <Card className="bg-gradient-card border-border/50 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Task Status Distribution
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              {taskStatusData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index] }} />
                  <span className="text-xs text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Priority Distribution Bar Chart */}
          <Card className="bg-gradient-card border-border/50 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Tasks by Priority
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={60} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(38 42% 60%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Task Trend Area Chart */}
          <Card className="bg-gradient-card border-border/50 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Task Trend (Last 4 Weeks)
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={taskTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="created" 
                    stackId="1"
                    stroke="hsl(38 42% 60%)" 
                    fill="hsl(38 42% 60% / 0.3)" 
                    name="Created"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="completed" 
                    stackId="2"
                    stroke="hsl(142 76% 36%)" 
                    fill="hsl(142 76% 36% / 0.3)" 
                    name="Completed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Team Composition */}
          <Card className="bg-gradient-card border-border/50 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Team Composition
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={roleDistribution.filter(r => r.value > 0)}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-card border-border/50 p-6">
            <h2 className="text-lg font-semibold mb-4">Task Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Active Tasks</span>
                <span className="font-bold text-primary">{stats.activeTasks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Completed Tasks</span>
                <span className="font-bold text-success">{stats.completedTasks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Overdue Tasks</span>
                <span className="font-bold text-destructive">{overdueTasks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pending Approvals</span>
                <span className="font-bold text-warning">{stats.pendingApprovals}</span>
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-card border-border/50 p-6">
            <h2 className="text-lg font-semibold mb-4">Team Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Members</span>
                <span className="font-bold">{employees.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Managers</span>
                <span className="font-bold">{stats.totalManagers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Employees</span>
                <span className="font-bold">{stats.totalEmployees}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Active Groups</span>
                <span className="font-bold">{stats.totalGroups}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

const EmployeeDashboard = () => {
  const tasks = [
    { id: 1, title: "Complete quarterly report", status: "completed", priority: "high", deadline: "2024-01-15" },
    { id: 2, title: "Review team documentation", status: "assigned", priority: "medium", deadline: "2024-01-20" },
    { id: 3, title: "Update project timeline", status: "overdue", priority: "high", deadline: "2024-01-10" },
    { id: 4, title: "Prepare presentation slides", status: "late", priority: "medium", deadline: "2024-01-12" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-success bg-success/10 border-success/30";
      case "overdue": return "text-overdue bg-overdue/10 border-overdue/30";
      case "late": return "text-late bg-late/10 border-late/30";
      default: return "text-foreground bg-muted border-border";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Employee Dashboard</h1>
          <p className="text-muted-foreground">Your tasks and performance overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Tasks</p>
                <p className="text-3xl font-bold">8</p>
              </div>
              <ClipboardList className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completed</p>
                <p className="text-3xl font-bold text-success">12</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
          </Card>

          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Overdue</p>
                <p className="text-3xl font-bold text-overdue">2</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-overdue" />
            </div>
          </Card>

          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Rank</p>
                <p className="text-3xl font-bold text-primary">A</p>
              </div>
              <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">A</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Tasks List */}
        <Card className="bg-gradient-card border-border/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">My Tasks</h2>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Completed
              </Badge>
              <Badge variant="outline" className="bg-late/10 text-late border-late/30">
                <Clock className="w-3 h-3 mr-1" />
                Late
              </Badge>
              <Badge variant="outline" className="bg-overdue/10 text-overdue border-overdue/30">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Overdue
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className="flex items-center justify-between p-4 bg-background/30 rounded-lg hover:bg-background/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{task.title}</h3>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                    <Badge variant="outline">
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Deadline: {new Date(task.deadline).toLocaleDateString()}
                  </p>
                </div>
                <Button size="sm" className="bg-primary/10 hover:bg-primary/20 text-primary">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

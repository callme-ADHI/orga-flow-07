import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock } from "lucide-react";

const MyTasks = () => {
  const tasks = [
    { id: 1, title: "Complete Project Documentation", priority: 1, status: "in_progress", dueDate: "2025-11-10", progress: 65 },
    { id: 2, title: "Review Code Changes", priority: 2, status: "assigned", dueDate: "2025-11-08", progress: 0 },
    { id: 3, title: "Update Database Schema", priority: 1, status: "in_progress", dueDate: "2025-11-12", progress: 45 },
    { id: 4, title: "Client Meeting Notes", priority: 3, status: "completed", dueDate: "2025-11-05", progress: 100 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "secondary";
      case "in_progress": return "default";
      case "assigned": return "outline";
      default: return "outline";
    }
  };

  const getPriorityLabel = (priority: number) => {
    return priority === 1 ? "High" : priority === 2 ? "Medium" : "Low";
  };

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
            My Tasks
          </h1>
          <p className="text-muted-foreground">View and manage your assigned tasks</p>
        </div>

        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card key={task.id} className="bg-gradient-card border-border/50 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Priority: {getPriorityLabel(task.priority)}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={getStatusColor(task.status)}>
                  {task.status.replace("_", " ")}
                </Badge>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{task.progress}%</span>
                </div>
                <Progress value={task.progress} className="h-2" />
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  View Details
                </Button>
                {task.status !== "completed" && (
                  <Button size="sm" className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30">
                    Update Progress
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyTasks;

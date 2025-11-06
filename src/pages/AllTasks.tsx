import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User } from "lucide-react";

const AllTasks = () => {
  const tasks = [
    { id: 1, title: "Complete Project Documentation", assignee: "John Smith", priority: 1, status: "in_progress", dueDate: "2025-11-10" },
    { id: 2, title: "Review Code Changes", assignee: "Sarah Johnson", priority: 2, status: "assigned", dueDate: "2025-11-08" },
    { id: 3, title: "Deploy to Production", assignee: "Mike Chen", priority: 1, status: "completed", dueDate: "2025-11-05" },
    { id: 4, title: "Client Meeting Preparation", assignee: "Emma Wilson", priority: 2, status: "assigned", dueDate: "2025-11-12" },
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
            All Tasks
          </h1>
          <p className="text-muted-foreground">View and manage all organization tasks</p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="assigned">Assigned</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-4">
              {tasks.map((task) => (
                <Card key={task.id} className="bg-gradient-card border-border/50 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{task.assignee}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Priority: {getPriorityLabel(task.priority)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(task.status)}>
                        {task.status.replace("_", " ")}
                      </Badge>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assigned" className="mt-6">
            <div className="grid gap-4">
              {tasks.filter(t => t.status === "assigned").map((task) => (
                <Card key={task.id} className="bg-gradient-card border-border/50 p-6">
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="in_progress" className="mt-6">
            <div className="grid gap-4">
              {tasks.filter(t => t.status === "in_progress").map((task) => (
                <Card key={task.id} className="bg-gradient-card border-border/50 p-6">
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="grid gap-4">
              {tasks.filter(t => t.status === "completed").map((task) => (
                <Card key={task.id} className="bg-gradient-card border-border/50 p-6">
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AllTasks;

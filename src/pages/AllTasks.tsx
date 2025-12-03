import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOrgData } from "@/hooks/useOrgData";

const AllTasks = () => {
  const navigate = useNavigate();
  const { tasks, loading } = useOrgData();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success/10 text-success border-success/30";
      case "in_progress": return "bg-primary/10 text-primary border-primary/30";
      case "assigned": return "bg-muted text-muted-foreground border-border";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getPriorityLabel = (priority: number) => {
    return priority === 1 ? "High" : priority === 2 ? "Medium" : "Low";
  };

  const getPriorityColor = (priority: number) => {
    return priority === 1 ? "bg-destructive/10 text-destructive border-destructive/30" : 
           priority === 2 ? "bg-warning/10 text-warning border-warning/30" : 
           "bg-muted text-muted-foreground border-border";
  };

  const assignedTasks = tasks.filter(t => t.status === "assigned");
  const inProgressTasks = tasks.filter(t => t.status === "in_progress");
  const completedTasks = tasks.filter(t => t.status === "completed");

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  const renderTaskList = (taskList: typeof tasks) => {
    if (taskList.length === 0) {
      return (
        <Card className="bg-gradient-card border-border/50 p-12 text-center">
          <ClipboardList className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Tasks</h3>
          <p className="text-muted-foreground">No tasks in this category</p>
        </Card>
      );
    }

    return (
      <div className="grid gap-4">
        {taskList.map((task) => (
          <Card key={task.id} className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                {task.description && (
                  <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{task.assignee_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(task.due_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Priority: {getPriorityLabel(task.priority || 2)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(task.status || "assigned")}>
                  {(task.status || "assigned").replace("_", " ")}
                </Badge>
                <Badge className={getPriorityColor(task.priority || 2)}>
                  {getPriorityLabel(task.priority || 2)}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
              All Tasks
            </h1>
            <p className="text-muted-foreground">View and manage all organization tasks</p>
          </div>
          <Button className="bg-gradient-gold text-primary-foreground" onClick={() => navigate("/create-task")}>
            Create Task
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
            <TabsTrigger value="assigned">Assigned ({assignedTasks.length})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({inProgressTasks.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {renderTaskList(tasks)}
          </TabsContent>

          <TabsContent value="assigned" className="mt-6">
            {renderTaskList(assignedTasks)}
          </TabsContent>

          <TabsContent value="in_progress" className="mt-6">
            {renderTaskList(inProgressTasks)}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {renderTaskList(completedTasks)}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AllTasks;

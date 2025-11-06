import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const CreateTask = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "2",
    dueDate: "",
    assignmentType: "individual",
    assignee: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Task created successfully!",
      description: "The task has been assigned to the team member.",
    });
    navigate("/all-tasks");
  };

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
            Create New Task
          </h1>
          <p className="text-muted-foreground">Assign tasks to team members or groups</p>
        </div>

        <Card className="bg-gradient-card border-border/50 p-8 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="mt-1"
                placeholder="Enter task title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1"
                placeholder="Enter task description"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">High</SelectItem>
                    <SelectItem value="2">Medium</SelectItem>
                    <SelectItem value="3">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="assignmentType">Assignment Type</Label>
              <Select value={formData.assignmentType} onValueChange={(value) => setFormData({ ...formData, assignmentType: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select assignment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                  <SelectItem value="rank">By Rank</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="assignee">Assign To</Label>
              <Select value={formData.assignee} onValueChange={(value) => setFormData({ ...formData, assignee: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="john">John Smith</SelectItem>
                  <SelectItem value="sarah">Sarah Johnson</SelectItem>
                  <SelectItem value="mike">Mike Chen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full bg-gradient-gold text-primary-foreground">
              Create Task
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateTask;

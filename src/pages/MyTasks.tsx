import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ClipboardList, Loader2, Play, Pause, Upload } from "lucide-react";
import { useMyTasks } from "@/hooks/useOrgData";
import { useWorkSessions, formatDuration } from "@/hooks/useWorkSessions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const MyTasks = () => {
  const { profile } = useAuth();
  const { tasks, loading, refreshTasks } = useMyTasks();
  const { activeSession, startWork, pauseWork, totalMinutes, getAccumulatedMinutesForTask } = useWorkSessions();
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);
  const [uploadingTask, setUploadingTask] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Timer for active session - accumulates previous session time
  useEffect(() => {
    if (!activeSession) {
      setElapsedSeconds(0);
      return;
    }

    // Get accumulated time from previous sessions for this task
    const previousMinutes = getAccumulatedMinutesForTask(activeSession.task_id);
    const previousSeconds = previousMinutes * 60;

    const startTime = new Date(activeSession.started_at).getTime();
    
    const updateTimer = () => {
      const now = Date.now();
      const currentSessionSeconds = Math.floor((now - startTime) / 1000);
      // Add previous sessions time to current session time
      setElapsedSeconds(previousSeconds + currentSessionSeconds);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSession, getAccumulatedMinutesForTask]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string, dueDate: string) => {
    if (status === "completed") return "bg-success/10 text-success border-success/30";
    const isOverdue = new Date(dueDate) < new Date();
    if (isOverdue) return "bg-destructive/10 text-destructive border-destructive/30";
    if (status === "in_progress") return "bg-primary/10 text-primary border-primary/30";
    return "bg-muted text-muted-foreground border-border";
  };

  const getPriorityLabel = (priority: number) => {
    return priority === 1 ? "High" : priority === 2 ? "Medium" : "Low";
  };

  const handleStartWork = async (taskId: string) => {
    setUpdatingTask(taskId);
    try {
      await startWork(taskId);
      
      // Update task status to in_progress if not already
      const task = tasks.find(t => t.id === taskId);
      if (task?.status === "assigned") {
        const { error } = await supabase
          .from("tasks")
          .update({ status: "in_progress" })
          .eq("id", taskId);
        
        if (error) {
          console.error("Error updating task status:", error);
        } else {
          refreshTasks();
        }
      }
      
      toast.success("Work timer started!");
    } catch (error: any) {
      toast.error("Failed to start timer");
    } finally {
      setUpdatingTask(null);
    }
  };

  const handlePauseWork = async () => {
    try {
      await pauseWork();
      toast.success("Work timer paused!");
    } catch (error: any) {
      toast.error("Failed to pause timer");
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    if (!profile?.id) return;

    setUpdatingTask(taskId);
    try {
      // Pause any active work session
      if (activeSession?.task_id === taskId) {
        await pauseWork();
      }

      // Update task status
      const { error: taskError } = await supabase
        .from("tasks")
        .update({ 
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", taskId);

      if (taskError) throw taskError;

      // Update assignment completion status
      const { error: assignError } = await supabase
        .from("task_assignments")
        .update({ 
          is_completed: true,
          completed_by_profile_id: profile.id,
        })
        .eq("task_id", taskId)
        .eq("profile_id", profile.id);

      if (assignError) {
        console.error("Assignment update error:", assignError);
      }

      // For "everyone" tasks, mark all other assignments as completed too
      const task = tasks.find(t => t.id === taskId);
      if (task?.assignment_type === "everyone") {
        await supabase
          .from("task_assignments")
          .update({ is_completed: true })
          .eq("task_id", taskId);
      }

      toast.success("Task completed!");
      refreshTasks();
    } catch (error: any) {
      toast.error(error.message || "Failed to complete task");
    } finally {
      setUpdatingTask(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !profile?.id || !selectedTaskId) return;

    const file = e.target.files[0];
    setUploadingTask(selectedTaskId);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedTaskId}/${profile.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("task-files")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("task-files")
        .getPublicUrl(fileName);

      // Save file reference to database
      const { error: dbError } = await supabase
        .from("task_files")
        .insert({
          task_id: selectedTaskId,
          profile_id: profile.id,
          file_name: file.name,
          file_url: urlData.publicUrl,
        });

      if (dbError) throw dbError;

      toast.success("Document uploaded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload document");
    } finally {
      setUploadingTask(null);
      setSelectedTaskId(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileUpload = (taskId: string) => {
    setSelectedTaskId(taskId);
    fileInputRef.current?.click();
  };

  // Get total time for a task (accumulated + current session if active)
  const getTaskTotalTime = (taskId: string): string | null => {
    const accumulatedMinutes = getAccumulatedMinutesForTask(taskId);
    if (accumulatedMinutes === 0 && activeSession?.task_id !== taskId) {
      return null;
    }
    return formatDuration(accumulatedMinutes);
  };

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
          <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
            My Tasks
          </h1>
          <p className="text-muted-foreground">View and manage your assigned tasks</p>
          {totalMinutes > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Total work time: {formatDuration(totalMinutes)}
            </p>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          onChange={handleFileUpload}
        />

        {tasks.length === 0 ? (
          <Card className="bg-gradient-card border-border/50 p-12 text-center">
            <ClipboardList className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Tasks Assigned</h3>
            <p className="text-muted-foreground">You don't have any tasks assigned to you yet</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => {
              const isOverdue = new Date(task.due_date) < new Date() && task.status !== "completed";
              const isActiveTask = activeSession?.task_id === task.id;
              const taskTotalTime = getTaskTotalTime(task.id);
              
              return (
                <Card key={task.id} className="bg-gradient-card border-border/50 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span className={isOverdue ? "text-destructive" : ""}>
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Priority: {getPriorityLabel(task.priority || 2)}</span>
                        </div>
                        {task.assignment_type === "everyone" && (
                          <Badge variant="outline" className="text-xs">Open to Everyone</Badge>
                        )}
                        {/* Show accumulated time for task */}
                        {taskTotalTime && !isActiveTask && (
                          <Badge variant="outline" className="text-xs">
                            Time: {taskTotalTime}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(task.status || "assigned", task.due_date)}>
                        {isOverdue && task.status !== "completed" ? "Overdue" : (task.status || "assigned").replace("_", " ")}
                      </Badge>
                      {/* Show running timer for active task */}
                      {isActiveTask && (
                        <div className="text-lg font-mono text-primary font-bold">
                          {formatTime(elapsedSeconds)}
                        </div>
                      )}
                    </div>
                  </div>

                  {task.status !== "completed" && (
                    <div className="flex gap-2 flex-wrap">
                      {!isActiveTask ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleStartWork(task.id)}
                          disabled={updatingTask === task.id || !!activeSession}
                        >
                          {updatingTask === task.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="mr-2 h-4 w-4" />
                          )}
                          {getAccumulatedMinutesForTask(task.id) > 0 ? "Resume Work" : "Start Work"}
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1 border-amber-500 text-amber-500"
                          onClick={handlePauseWork}
                        >
                          <Pause className="mr-2 h-4 w-4" />
                          Pause Work
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                        onClick={() => triggerFileUpload(task.id)}
                        disabled={uploadingTask === task.id}
                      >
                        {uploadingTask === task.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="mr-2 h-4 w-4" />
                        )}
                        Upload Doc
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                        onClick={() => handleCompleteTask(task.id)}
                        disabled={updatingTask === task.id}
                      >
                        {updatingTask === task.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Mark Complete
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyTasks;
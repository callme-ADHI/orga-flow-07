import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current time and calculate reminder windows
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);

    // Fetch tasks due within 24 hours that haven't been reminded yet
    const { data: tasksDue24h, error: tasks24hError } = await supabase
      .from("tasks")
      .select(`
        id,
        title,
        due_date,
        status,
        task_assignments (
          profile_id,
          completed
        )
      `)
      .eq("status", "in_progress")
      .gte("due_date", now.toISOString())
      .lte("due_date", tomorrow.toISOString());

    if (tasks24hError) {
      console.error("Error fetching tasks:", tasks24hError);
      throw tasks24hError;
    }

    const notificationsToCreate: {
      profile_id: string;
      title: string;
      message: string;
      type: string;
    }[] = [];

    for (const task of tasksDue24h || []) {
      const dueDate = new Date(task.due_date);
      const hoursUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));
      
      // Determine reminder type based on time until due
      let reminderType = "";
      let reminderMessage = "";
      
      if (hoursUntilDue <= 1) {
        reminderType = "task_due_1h";
        reminderMessage = `⚠️ URGENT: Task "${task.title}" is due in less than 1 hour!`;
      } else if (hoursUntilDue <= 24) {
        reminderType = "task_due_24h";
        reminderMessage = `📋 Reminder: Task "${task.title}" is due within 24 hours.`;
      }

      if (reminderType && task.task_assignments) {
        for (const assignment of task.task_assignments) {
          // Only notify assignees who haven't completed the task
          if (!assignment.completed && assignment.profile_id) {
            // Check if we already sent this reminder type for this task to this user
            const { data: existingNotification } = await supabase
              .from("notifications")
              .select("id")
              .eq("profile_id", assignment.profile_id)
              .eq("type", reminderType)
              .ilike("message", `%${task.id}%`)
              .maybeSingle();

            if (!existingNotification) {
              notificationsToCreate.push({
                profile_id: assignment.profile_id,
                title: hoursUntilDue <= 1 ? "Urgent Task Reminder" : "Task Due Soon",
                message: `${reminderMessage} (Task ID: ${task.id})`,
                type: reminderType,
              });
            }
          }
        }
      }
    }

    // Batch insert notifications
    if (notificationsToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from("notifications")
        .insert(notificationsToCreate);

      if (insertError) {
        console.error("Error creating notifications:", insertError);
        throw insertError;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationsSent: notificationsToCreate.length,
        tasksChecked: tasksDue24h?.length || 0
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error: unknown) {
    console.error("Error in task-reminders function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
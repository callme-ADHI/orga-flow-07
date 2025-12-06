import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface WorkSession {
  id: string;
  task_id: string;
  profile_id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

export function useWorkSessions(taskId?: string) {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [activeSession, setActiveSession] = useState<WorkSession | null>(null);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    if (!profile?.id) return;

    let query = supabase
      .from("work_sessions")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });

    if (taskId) {
      query = query.eq("task_id", taskId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching work sessions:", error);
      setLoading(false);
      return;
    }

    const typedData = (data || []) as WorkSession[];
    setSessions(typedData);
    
    const active = typedData.find(s => s.is_active);
    setActiveSession(active || null);
    
    const total = typedData.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    setTotalMinutes(total);
    
    setLoading(false);
  }, [profile?.id, taskId]);

  const startWork = async (taskIdToStart: string): Promise<WorkSession | null> => {
    if (!profile?.id) return null;

    // End any existing active session first
    if (activeSession) {
      await pauseWork();
    }

    const { data, error } = await supabase
      .from("work_sessions")
      .insert({
        task_id: taskIdToStart,
        profile_id: profile.id,
        is_active: true,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("Error starting work session:", error);
      return null;
    }

    const typedData = data as WorkSession;
    setActiveSession(typedData);
    setSessions(prev => [typedData, ...prev]);
    return typedData;
  };

  const pauseWork = async () => {
    if (!activeSession || !profile?.id) return;

    const startTime = new Date(activeSession.started_at);
    const endTime = new Date();
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    const { error } = await supabase
      .from("work_sessions")
      .update({
        ended_at: endTime.toISOString(),
        duration_minutes: durationMinutes,
        is_active: false
      })
      .eq("id", activeSession.id);

    if (error) {
      console.error("Error pausing work session:", error);
      return;
    }

    setActiveSession(null);
    setTotalMinutes(prev => prev + durationMinutes);
    setSessions(prev =>
      prev.map(s =>
        s.id === activeSession.id
          ? { ...s, ended_at: endTime.toISOString(), duration_minutes: durationMinutes, is_active: false }
          : s
      )
    );
  };

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    activeSession,
    totalMinutes,
    loading,
    startWork,
    pauseWork,
    refresh: fetchSessions
  };
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

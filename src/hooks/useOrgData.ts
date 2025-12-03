import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Employee {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  rank: string | null;
  custom_id: string | null;
  approved: boolean;
  resume_url: string | null;
  created_at: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: number;
  due_date: string;
  assignment_type: string;
  assigned_rank: string | null;
  assigned_by: string;
  org_id: string;
  created_at: string;
  completed_at: string | null;
  overdue_flag: boolean;
}

interface TaskWithAssignee extends Task {
  assignee_name?: string;
  assignee_id?: string;
}

interface Group {
  id: string;
  group_name: string;
  group_rank: string | null;
  org_id: string;
  leader_id: string | null;
  created_by: string | null;
  created_at: string;
  member_count?: number;
  leader_name?: string;
}

interface OrgStats {
  totalEmployees: number;
  totalManagers: number;
  pendingApprovals: number;
  activeTasks: number;
  completedTasks: number;
  totalGroups: number;
  completionRate: number;
}

export function useOrgData() {
  const { profile } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pendingUsers, setPendingUsers] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<TaskWithAssignee[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [stats, setStats] = useState<OrgStats>({
    totalEmployees: 0,
    totalManagers: 0,
    pendingApprovals: 0,
    activeTasks: 0,
    completedTasks: 0,
    totalGroups: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    if (!profile?.org_id) return [];

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("org_id", profile.org_id)
      .eq("approved", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching employees:", error);
      return [];
    }
    return data || [];
  }, [profile?.org_id]);

  const fetchPendingUsers = useCallback(async () => {
    if (!profile?.org_id) return [];

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("org_id", profile.org_id)
      .eq("approved", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pending users:", error);
      return [];
    }
    return data || [];
  }, [profile?.org_id]);

  const fetchTasks = useCallback(async () => {
    if (!profile?.org_id) return [];

    const { data: tasksData, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .eq("org_id", profile.org_id)
      .order("created_at", { ascending: false });

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
      return [];
    }

    // Get task assignments with profile names
    const tasksWithAssignees: TaskWithAssignee[] = [];
    
    for (const task of tasksData || []) {
      const { data: assignments } = await supabase
        .from("task_assignments")
        .select("profile_id, profiles:profile_id(name)")
        .eq("task_id", task.id)
        .limit(1)
        .single();

      tasksWithAssignees.push({
        ...task,
        assignee_name: (assignments?.profiles as any)?.name || "Unassigned",
        assignee_id: assignments?.profile_id || undefined,
      });
    }

    return tasksWithAssignees;
  }, [profile?.org_id]);

  const fetchGroups = useCallback(async () => {
    if (!profile?.org_id) return [];

    const { data: groupsData, error: groupsError } = await supabase
      .from("groups")
      .select("*")
      .eq("org_id", profile.org_id)
      .order("created_at", { ascending: false });

    if (groupsError) {
      console.error("Error fetching groups:", groupsError);
      return [];
    }

    // Get member counts and leader names
    const groupsWithDetails: Group[] = [];
    
    for (const group of groupsData || []) {
      const { count } = await supabase
        .from("group_members")
        .select("*", { count: "exact", head: true })
        .eq("group_id", group.id);

      let leaderName = "No Leader";
      if (group.leader_id) {
        const { data: leader } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", group.leader_id)
          .single();
        leaderName = leader?.name || "Unknown";
      }

      groupsWithDetails.push({
        ...group,
        member_count: count || 0,
        leader_name: leaderName,
      });
    }

    return groupsWithDetails;
  }, [profile?.org_id]);

  const refreshData = useCallback(async () => {
    if (!profile?.org_id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [employeesData, pendingData, tasksData, groupsData] = await Promise.all([
        fetchEmployees(),
        fetchPendingUsers(),
        fetchTasks(),
        fetchGroups(),
      ]);

      setEmployees(employeesData);
      setPendingUsers(pendingData);
      setTasks(tasksData);
      setGroups(groupsData);

      // Calculate stats
      const totalEmployees = employeesData.filter(e => e.role === "Employee").length;
      const totalManagers = employeesData.filter(e => e.role === "Manager").length;
      const activeTasks = tasksData.filter(t => t.status !== "completed").length;
      const completedTasks = tasksData.filter(t => t.status === "completed").length;
      const completionRate = tasksData.length > 0 
        ? Math.round((completedTasks / tasksData.length) * 100) 
        : 0;

      setStats({
        totalEmployees,
        totalManagers,
        pendingApprovals: pendingData.length,
        activeTasks,
        completedTasks,
        totalGroups: groupsData.length,
        completionRate,
      });
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching org data:", err);
    } finally {
      setLoading(false);
    }
  }, [profile?.org_id, fetchEmployees, fetchPendingUsers, fetchTasks, fetchGroups]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    employees,
    pendingUsers,
    tasks,
    groups,
    stats,
    loading,
    error,
    refreshData,
  };
}

export function useMyTasks() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<TaskWithAssignee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyTasks = useCallback(async () => {
    if (!profile?.id) return;

    setLoading(true);

    // Get task assignments for current user
    const { data: assignments, error: assignError } = await supabase
      .from("task_assignments")
      .select("task_id, is_completed")
      .eq("profile_id", profile.id);

    if (assignError) {
      console.error("Error fetching assignments:", assignError);
      setLoading(false);
      return;
    }

    if (!assignments || assignments.length === 0) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const taskIds = assignments.map(a => a.task_id);

    const { data: tasksData, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .in("id", taskIds)
      .order("due_date", { ascending: true });

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
      setLoading(false);
      return;
    }

    setTasks(tasksData || []);
    setLoading(false);
  }, [profile?.id]);

  useEffect(() => {
    fetchMyTasks();
  }, [fetchMyTasks]);

  return { tasks, loading, refreshTasks: fetchMyTasks };
}

export function useMyGroups() {
  const { profile } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyGroups = useCallback(async () => {
    if (!profile?.id) return;

    setLoading(true);

    // Get group memberships for current user
    const { data: memberships, error: memberError } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("profile_id", profile.id);

    if (memberError) {
      console.error("Error fetching memberships:", memberError);
      setLoading(false);
      return;
    }

    if (!memberships || memberships.length === 0) {
      setGroups([]);
      setLoading(false);
      return;
    }

    const groupIds = memberships.map(m => m.group_id);

    const { data: groupsData, error: groupsError } = await supabase
      .from("groups")
      .select("*")
      .in("id", groupIds);

    if (groupsError) {
      console.error("Error fetching groups:", groupsError);
      setLoading(false);
      return;
    }

    // Get member counts
    const groupsWithCounts: Group[] = [];
    for (const group of groupsData || []) {
      const { count } = await supabase
        .from("group_members")
        .select("*", { count: "exact", head: true })
        .eq("group_id", group.id);

      let leaderName = "No Leader";
      if (group.leader_id) {
        const { data: leader } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", group.leader_id)
          .single();
        leaderName = leader?.name || "Unknown";
      }

      groupsWithCounts.push({
        ...group,
        member_count: count || 0,
        leader_name: leaderName,
      });
    }

    setGroups(groupsWithCounts);
    setLoading(false);
  }, [profile?.id]);

  useEffect(() => {
    fetchMyGroups();
  }, [fetchMyGroups]);

  return { groups, loading, refreshGroups: fetchMyGroups };
}

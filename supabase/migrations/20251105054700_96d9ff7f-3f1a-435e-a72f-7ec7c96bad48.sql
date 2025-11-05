-- ORGA Complete Database Schema
-- Organization Management with DSA Integration

-- ================================================
-- 1. ORGANIZATIONS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_name TEXT UNIQUE NOT NULL,
  org_password TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- ================================================
-- 2. PROFILES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  custom_id TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('CEO', 'Manager', 'Employee')),
  rank TEXT CHECK (rank IN ('S', 'A', 'B', 'C', 'D', 'E')),
  resume_url TEXT,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ================================================
-- 3. GROUPS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  group_name TEXT NOT NULL,
  group_rank TEXT CHECK (group_rank IN ('S', 'A', 'B', 'C', 'D', 'E')),
  leader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- ================================================
-- 4. GROUP MEMBERS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(group_id, profile_id)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- ================================================
-- 5. TASKS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('individual', 'group', 'rank')),
  assigned_rank TEXT CHECK (assigned_rank IN ('S', 'A', 'B', 'C', 'D', 'E')),
  priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'overdue', 'completed_late')),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  overdue_flag BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- ================================================
-- 6. TASK ASSIGNMENTS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  completed_by_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CHECK ((profile_id IS NOT NULL) OR (group_id IS NOT NULL))
);

ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;

-- ================================================
-- 7. TASK FILES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.task_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.task_files ENABLE ROW LEVEL SECURITY;

-- ================================================
-- 8. BLACK MARKS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.black_marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.black_marks ENABLE ROW LEVEL SECURITY;

-- ================================================
-- 9. NOTIFICATIONS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('task_assigned', 'task_completed', 'task_overdue', 'member_request', 'member_approved', 'group_update', 'announcement')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ================================================
-- RLS POLICIES
-- ================================================

-- Organizations
CREATE POLICY "Organizations viewable by members"
  ON public.organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.org_id = organizations.id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "CEO can update organization"
  ON public.organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.org_id = organizations.id
      AND profiles.user_id = auth.uid()
      AND profiles.role = 'CEO'
    )
  );

-- Profiles
CREATE POLICY "Profiles viewable by org members"
  ON public.profiles FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "CEO and Managers can update profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.org_id = profiles.org_id
      AND p.role IN ('CEO', 'Manager')
    )
  );

-- Groups
CREATE POLICY "Groups viewable by org members"
  ON public.groups FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Managers and CEO can create groups"
  ON public.groups FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.org_id = groups.org_id
      AND profiles.role IN ('CEO', 'Manager')
    )
  );

CREATE POLICY "Managers and CEO can update groups"
  ON public.groups FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.org_id = groups.org_id
      AND profiles.role IN ('CEO', 'Manager')
    )
  );

CREATE POLICY "Managers and CEO can delete groups"
  ON public.groups FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.org_id = groups.org_id
      AND profiles.role IN ('CEO', 'Manager')
    )
  );

-- Group members
CREATE POLICY "Group members viewable by org members"
  ON public.group_members FOR SELECT
  USING (
    group_id IN (
      SELECT g.id FROM public.groups g
      WHERE g.org_id IN (
        SELECT org_id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Managers can add group members"
  ON public.group_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.groups g
      JOIN public.profiles p ON p.org_id = g.org_id
      WHERE g.id = group_members.group_id
      AND p.user_id = auth.uid()
      AND p.role IN ('CEO', 'Manager')
    )
  );

CREATE POLICY "Managers can remove group members"
  ON public.group_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.groups g
      JOIN public.profiles p ON p.org_id = g.org_id
      WHERE g.id = group_members.group_id
      AND p.user_id = auth.uid()
      AND p.role IN ('CEO', 'Manager')
    )
  );

-- Tasks
CREATE POLICY "Tasks viewable by org members"
  ON public.tasks FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Managers and CEO can create tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.org_id = tasks.org_id
      AND profiles.role IN ('CEO', 'Manager')
    )
  );

CREATE POLICY "Assigned users can update task status"
  ON public.tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.task_assignments ta
      JOIN public.profiles p ON p.id = ta.profile_id
      WHERE ta.task_id = tasks.id
      AND p.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.org_id = tasks.org_id
      AND profiles.role IN ('CEO', 'Manager')
    )
  );

-- Task Assignments
CREATE POLICY "Task assignments viewable by org members"
  ON public.task_assignments FOR SELECT
  USING (
    task_id IN (
      SELECT t.id FROM public.tasks t
      WHERE t.org_id IN (
        SELECT org_id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Managers can create assignments"
  ON public.task_assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.profiles p ON p.org_id = t.org_id
      WHERE t.id = task_assignments.task_id
      AND p.user_id = auth.uid()
      AND p.role IN ('CEO', 'Manager')
    )
  );

CREATE POLICY "Assigned users can update completion status"
  ON public.task_assignments FOR UPDATE
  USING (
    profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Task Files
CREATE POLICY "Task files viewable by org members"
  ON public.task_files FOR SELECT
  USING (
    task_id IN (
      SELECT t.id FROM public.tasks t
      WHERE t.org_id IN (
        SELECT org_id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can upload files to their tasks"
  ON public.task_files FOR INSERT
  WITH CHECK (
    profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Black Marks
CREATE POLICY "Black marks viewable by org members"
  ON public.black_marks FOR SELECT
  USING (
    profile_id IN (
      SELECT p.id FROM public.profiles p
      WHERE p.org_id IN (
        SELECT org_id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (
    profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- ================================================
-- FUNCTIONS AND TRIGGERS
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate custom IDs
CREATE OR REPLACE FUNCTION generate_custom_id(role_type TEXT, org_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  next_id INTEGER;
  prefix TEXT;
BEGIN
  IF role_type = 'CEO' THEN
    RETURN 'CEO001';
  ELSIF role_type = 'Manager' THEN
    prefix := 'MNR';
  ELSE
    prefix := 'EMP';
  END IF;
  
  SELECT COUNT(*) + 1 INTO next_id
  FROM public.profiles
  WHERE org_id = org_uuid AND role = role_type;
  
  RETURN prefix || LPAD(next_id::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Enable Realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
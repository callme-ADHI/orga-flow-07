-- Create work_sessions table for time tracking
CREATE TABLE public.work_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for work_sessions
CREATE POLICY "Users can view work sessions in their org"
ON public.work_sessions FOR SELECT
USING (profile_id IN (
  SELECT p.id FROM profiles p
  WHERE p.org_id IN (SELECT profiles.org_id FROM profiles WHERE profiles.user_id = auth.uid())
));

CREATE POLICY "Users can create their own work sessions"
ON public.work_sessions FOR INSERT
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own work sessions"
ON public.work_sessions FOR UPDATE
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create complaints table
CREATE TABLE public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- RLS policies for complaints
CREATE POLICY "Users can view complaints in their org"
ON public.complaints FOR SELECT
USING (org_id IN (SELECT org_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can submit complaints"
ON public.complaints FOR INSERT
WITH CHECK (org_id IN (SELECT org_id FROM profiles WHERE user_id = auth.uid())
  AND submitted_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "CEO and Managers can update complaints"
ON public.complaints FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM profiles p
  WHERE p.user_id = auth.uid()
  AND p.org_id = complaints.org_id
  AND p.role IN ('CEO', 'Manager')
));

-- Enable realtime for work_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.work_sessions;
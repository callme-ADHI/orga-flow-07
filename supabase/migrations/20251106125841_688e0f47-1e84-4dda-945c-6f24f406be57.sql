-- Add INSERT policy for organizations (so users can create orgs)
CREATE POLICY "Users can create organizations" 
ON public.organizations 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Update profiles table to auto-approve CEOs
CREATE OR REPLACE FUNCTION public.auto_approve_ceo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'CEO' THEN
    NEW.approved := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_profile_created_auto_approve_ceo
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_approve_ceo();

-- Add policy for CEO to insert their own organization without being part of it yet
CREATE POLICY "Anyone can insert organization" 
ON public.organizations 
FOR INSERT 
WITH CHECK (true);

-- Drop the old policy if it exists
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;

-- Update the profiles SELECT policy to allow users to see their own profile even before org assignment
DROP POLICY IF EXISTS "Profiles viewable by org members" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid() OR org_id IN (
  SELECT org_id FROM profiles WHERE user_id = auth.uid()
));

-- Add policy for managers to approve profiles
CREATE POLICY "Managers can approve employees in their org" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.org_id = profiles.org_id 
    AND p.role IN ('CEO', 'Manager')
    AND p.approved = true
  )
);

-- Ensure black_marks can be created by managers
CREATE POLICY "Managers can create black marks" 
ON public.black_marks 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('CEO', 'Manager')
    AND p.approved = true
  )
);

-- Add notification creation policy for system
CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_org_id ON public.profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON public.tasks(org_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_task_assignments_profile_id ON public.task_assignments(profile_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_task_id ON public.task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_notifications_profile_id ON public.notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_group_members_profile_id ON public.group_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
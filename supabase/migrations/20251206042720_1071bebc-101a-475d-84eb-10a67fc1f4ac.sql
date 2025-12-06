-- Drop existing complaints RLS policies
DROP POLICY IF EXISTS "Users can view complaints in their org" ON public.complaints;
DROP POLICY IF EXISTS "CEO and Managers can update complaints" ON public.complaints;
DROP POLICY IF EXISTS "Users can submit complaints" ON public.complaints;

-- Create new RLS policies for complaints

-- 1. Employees can only see their own complaints
CREATE POLICY "Employees can view own complaints" 
ON public.complaints 
FOR SELECT 
USING (
  submitted_by IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

-- 2. CEO can view all complaints in their org
CREATE POLICY "CEO can view all complaints" 
ON public.complaints 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.org_id = complaints.org_id
    AND p.role = 'CEO'
  )
);

-- 3. Managers can view all complaints in their org  
CREATE POLICY "Managers can view all complaints" 
ON public.complaints 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.org_id = complaints.org_id
    AND p.role = 'Manager'
  )
);

-- 4. All users can submit complaints
CREATE POLICY "Users can submit complaints" 
ON public.complaints 
FOR INSERT 
WITH CHECK (
  (org_id IN (SELECT profiles.org_id FROM profiles WHERE profiles.user_id = auth.uid()))
  AND (submitted_by IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
);

-- 5. CEO and Managers can update complaints
CREATE POLICY "CEO and Managers can update complaints" 
ON public.complaints 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.org_id = complaints.org_id
    AND p.role IN ('CEO', 'Manager')
  )
);
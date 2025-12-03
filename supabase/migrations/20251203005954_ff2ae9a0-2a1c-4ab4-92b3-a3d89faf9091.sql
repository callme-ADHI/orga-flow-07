-- Fix organizations INSERT policy - must be PERMISSIVE
DROP POLICY IF EXISTS "Anyone can insert organization" ON public.organizations;

CREATE POLICY "Anyone can insert organization" 
ON public.organizations 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Also need to allow reading organization by ID for joining (before profile exists)
DROP POLICY IF EXISTS "Organizations viewable by members" ON public.organizations;
DROP POLICY IF EXISTS "Anyone can read organizations for joining" ON public.organizations;

-- Allow authenticated users to read organizations (needed for joining)
CREATE POLICY "Anyone can read organizations for joining" 
ON public.organizations 
FOR SELECT 
TO authenticated
USING (true);

-- CEO can still update their own organization
DROP POLICY IF EXISTS "CEO can update organization" ON public.organizations;

CREATE POLICY "CEO can update organization" 
ON public.organizations 
FOR UPDATE 
TO authenticated
USING (created_by = auth.uid());
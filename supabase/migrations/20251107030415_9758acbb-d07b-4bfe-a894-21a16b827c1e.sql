-- Fix infinite recursion in profiles RLS policy
-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a security definer function to check org membership
CREATE OR REPLACE FUNCTION public.check_same_org(check_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
    AND org_id = check_org_id
  );
$$;

-- Create new policy without recursion
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (
  user_id = auth.uid() 
  OR 
  public.check_same_org(org_id)
);

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for resume storage
CREATE POLICY "Users can upload their own resume"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(storage.objects.name))[1]
);

CREATE POLICY "Users can view their own resume"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(storage.objects.name))[1]
);

CREATE POLICY "Managers can view resumes in their org"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes'
  AND EXISTS (
    SELECT 1
    FROM public.profiles p1
    JOIN public.profiles p2 ON p1.org_id = p2.org_id
    WHERE p1.user_id = auth.uid()
    AND p1.role IN ('CEO', 'Manager')
    AND p2.user_id::text = (storage.foldername(storage.objects.name))[1]
  )
);

CREATE POLICY "Users can update their own resume"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(storage.objects.name))[1]
);

CREATE POLICY "Users can delete their own resume"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(storage.objects.name))[1]
);
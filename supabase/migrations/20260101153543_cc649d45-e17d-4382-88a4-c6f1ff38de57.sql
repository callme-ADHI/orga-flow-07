-- Fix storage policies for resumes and task-files buckets
-- First, ensure buckets exist and are properly configured

-- Make resumes bucket public for viewing
UPDATE storage.buckets SET public = true WHERE id = 'resumes';

-- Create storage policies using storage.objects table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view resumes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Org members can view task files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload task files" ON storage.objects;

-- Resumes bucket policies
CREATE POLICY "Public can view resumes" ON storage.objects
FOR SELECT USING (bucket_id = 'resumes');

CREATE POLICY "Authenticated users can upload resumes" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'resumes' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own resumes" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own resumes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Task files bucket policies
CREATE POLICY "Org members can view task files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'task-files'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can upload task files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'task-files' 
  AND auth.role() = 'authenticated'
);
-- Ensure resumes bucket exists with proper configuration
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- RLS policies for resumes bucket (allow authenticated users to upload and view)
DROP POLICY IF EXISTS "Users can upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Resumes are publicly viewable" ON storage.objects;

CREATE POLICY "Users can upload resumes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resumes' AND auth.uid() IS NOT NULL);

CREATE POLICY "Resumes are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'resumes');
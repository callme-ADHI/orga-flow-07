-- Create task-files storage bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('task-files', 'task-files', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for task-files bucket
CREATE POLICY "Users can upload task files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'task-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Org members can view task files"
ON storage.objects FOR SELECT
USING (bucket_id = 'task-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own task files"
ON storage.objects FOR DELETE
USING (bucket_id = 'task-files' AND auth.uid()::text = (storage.foldername(name))[1]);
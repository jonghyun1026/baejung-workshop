-- Storage bucket for photos and videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true);

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view files
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'photos');

-- Policy: Anyone can upload files
CREATE POLICY "Anyone can upload photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'photos');

-- Policy: Users can update their own files
CREATE POLICY "Users can update own photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete own photos" ON storage.objects
FOR DELETE USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 임시로 모든 사용자가 업로드할 수 있도록 하는 정책 (실제 환경에서는 인증 후 사용)
CREATE POLICY "Temporary upload policy" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Temporary update policy" ON storage.objects
FOR UPDATE USING (bucket_id = 'photos');

CREATE POLICY "Temporary delete policy" ON storage.objects
FOR DELETE USING (bucket_id = 'photos'); 
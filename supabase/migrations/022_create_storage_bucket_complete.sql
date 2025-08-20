-- Storage bucket for photos and videos 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete photos" ON storage.objects;
DROP POLICY IF EXISTS "Temporary upload policy" ON storage.objects;
DROP POLICY IF EXISTS "Temporary update policy" ON storage.objects;
DROP POLICY IF EXISTS "Temporary delete policy" ON storage.objects;

-- 새로운 정책 생성
-- Policy: 모든 사람이 파일을 볼 수 있음
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'photos');

-- Policy: 모든 사람이 파일을 업로드할 수 있음
CREATE POLICY "Anyone can upload photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'photos');

-- Policy: 모든 사람이 파일을 업데이트할 수 있음
CREATE POLICY "Anyone can update photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'photos');

-- Policy: 모든 사람이 파일을 삭제할 수 있음  
CREATE POLICY "Anyone can delete photos" ON storage.objects
FOR DELETE USING (bucket_id = 'photos');

-- Storage 버킷이 제대로 생성되었는지 확인
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'photos') THEN
        RAISE NOTICE 'Storage bucket "photos" created successfully!';
    ELSE
        RAISE EXCEPTION 'Failed to create storage bucket "photos"';
    END IF;
END $$; 
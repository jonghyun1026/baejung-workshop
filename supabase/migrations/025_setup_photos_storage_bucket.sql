-- Storage 버킷 설정
-- 이 스크립트는 Supabase Storage에서 photos 버킷을 생성하고 정책을 설정합니다.

-- photos 버킷 생성 (이미 존재하면 무시)
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage 정책 설정

-- 기존 정책 삭제 (충돌 방지)
DROP POLICY IF EXISTS "모든 사용자가 사진을 업로드할 수 있음" ON storage.objects;
DROP POLICY IF EXISTS "모든 사용자가 사진을 조회할 수 있음" ON storage.objects;
DROP POLICY IF EXISTS "업로드한 사용자만 사진을 삭제할 수 있음" ON storage.objects;

-- 새 정책 생성
CREATE POLICY "모든 사용자가 사진을 업로드할 수 있음"
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'photos');

CREATE POLICY "모든 사용자가 사진을 조회할 수 있음"
ON storage.objects FOR SELECT 
USING (bucket_id = 'photos');

CREATE POLICY "업로드한 사용자만 사진을 삭제할 수 있음"
ON storage.objects FOR DELETE 
USING (bucket_id = 'photos');


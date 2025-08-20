-- photos 테이블 생성
CREATE TABLE IF NOT EXISTS public.photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_path TEXT NOT NULL,
    caption TEXT,
    uploaded_by UUID NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT photos_uploaded_by_fkey FOREIGN KEY (uploaded_by) 
        REFERENCES public.users(id) ON DELETE CASCADE
);

-- RLS 활성화
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- 정책 생성
CREATE POLICY "모든 사용자가 사진을 조회할 수 있음" ON public.photos
    FOR SELECT USING (true);

CREATE POLICY "모든 사용자가 사진을 업로드할 수 있음" ON public.photos
    FOR INSERT WITH CHECK (true);

CREATE POLICY "업로드한 사용자만 사진을 수정할 수 있음" ON public.photos
    FOR UPDATE USING (uploaded_by = auth.uid());

CREATE POLICY "업로드한 사용자만 사진을 삭제할 수 있음" ON public.photos
    FOR DELETE USING (uploaded_by = auth.uid());

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS photos_created_at_idx ON public.photos(created_at DESC);
CREATE INDEX IF NOT EXISTS photos_uploaded_by_idx ON public.photos(uploaded_by);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_photos_updated_at 
    BEFORE UPDATE ON public.photos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 
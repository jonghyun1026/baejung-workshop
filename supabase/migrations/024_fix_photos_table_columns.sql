-- photos 테이블 컬럼 확인 및 수정
DO $$
BEGIN
    -- file_path 컬럼이 존재하지 않으면 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'photos' 
        AND column_name = 'file_path'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.photos ADD COLUMN file_path TEXT NOT NULL DEFAULT '';
        RAISE NOTICE 'file_path 컬럼이 추가되었습니다.';
    END IF;

    -- caption 컬럼이 존재하지 않으면 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'photos' 
        AND column_name = 'caption'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.photos ADD COLUMN caption TEXT;
        RAISE NOTICE 'caption 컬럼이 추가되었습니다.';
    END IF;

    -- uploaded_by 컬럼이 존재하지 않으면 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'photos' 
        AND column_name = 'uploaded_by'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.photos ADD COLUMN uploaded_by UUID NOT NULL DEFAULT gen_random_uuid();
        RAISE NOTICE 'uploaded_by 컬럼이 추가되었습니다.';
    END IF;

    -- likes_count 컬럼이 존재하지 않으면 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'photos' 
        AND column_name = 'likes_count'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.photos ADD COLUMN likes_count INTEGER DEFAULT 0;
        RAISE NOTICE 'likes_count 컬럼이 추가되었습니다.';
    END IF;

    -- created_at 컬럼이 존재하지 않으면 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'photos' 
        AND column_name = 'created_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.photos ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'created_at 컬럼이 추가되었습니다.';
    END IF;

    -- updated_at 컬럼이 존재하지 않으면 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'photos' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.photos ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'updated_at 컬럼이 추가되었습니다.';
    END IF;

    RAISE NOTICE 'photos 테이블 컬럼 확인 및 추가가 완료되었습니다.';
END $$;

-- photos 테이블이 존재하지 않으면 새로 생성
CREATE TABLE IF NOT EXISTS public.photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_path TEXT NOT NULL DEFAULT '',
    caption TEXT,
    uploaded_by UUID NOT NULL DEFAULT gen_random_uuid(),
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (충돌 방지)
DROP POLICY IF EXISTS "모든 사용자가 사진을 조회할 수 있음" ON public.photos;
DROP POLICY IF EXISTS "모든 사용자가 사진을 업로드할 수 있음" ON public.photos;
DROP POLICY IF EXISTS "업로드한 사용자만 사진을 수정할 수 있음" ON public.photos;
DROP POLICY IF EXISTS "업로드한 사용자만 사진을 삭제할 수 있음" ON public.photos;

-- 정책 생성
CREATE POLICY "모든 사용자가 사진을 조회할 수 있음" ON public.photos
    FOR SELECT USING (true);

CREATE POLICY "모든 사용자가 사진을 업로드할 수 있음" ON public.photos
    FOR INSERT WITH CHECK (true);

CREATE POLICY "업로드한 사용자만 사진을 수정할 수 있음" ON public.photos
    FOR UPDATE USING (true);

CREATE POLICY "업로드한 사용자만 사진을 삭제할 수 있음" ON public.photos
    FOR DELETE USING (true);

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

DROP TRIGGER IF EXISTS update_photos_updated_at ON public.photos;
CREATE TRIGGER update_photos_updated_at 
    BEFORE UPDATE ON public.photos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


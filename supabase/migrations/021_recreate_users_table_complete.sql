-- users 테이블 완전 재생성 (CSV 업로드 문제 완전 해결)

-- 1. 기존 테이블 구조 확인
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. 누락된 컬럼들 추가 (존재하지 않는 경우에만)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'student',
ADD COLUMN IF NOT EXISTS program VARCHAR(200),
ADD COLUMN IF NOT EXISTS status VARCHAR(50),
ADD COLUMN IF NOT EXISTS ws_group VARCHAR(100),
ADD COLUMN IF NOT EXISTS second_term_group VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS attendance VARCHAR(50);

-- 3. NOT NULL 제약조건 제거 (CSV에 없는 컬럼들)
ALTER TABLE users 
ALTER COLUMN birth_date DROP NOT NULL,
ALTER COLUMN location DROP NOT NULL,
ALTER COLUMN mbti DROP NOT NULL;

-- 4. 기본값 설정
ALTER TABLE users 
ALTER COLUMN birth_date SET DEFAULT NULL,
ALTER COLUMN location SET DEFAULT NULL,
ALTER COLUMN mbti SET DEFAULT NULL,
ALTER COLUMN role SET DEFAULT 'student';

-- 5. 기존 제약조건 제거 (있다면)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check') THEN
        ALTER TABLE users DROP CONSTRAINT users_role_check;
    END IF;
END $$;

-- 6. 최종 테이블 구조 확인
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position; 
-- users 테이블에 role 컬럼 추가

-- 1. 먼저 현재 테이블 구조 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. role 컬럼이 없다면 추가
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'student';

-- 3. role 컬럼에 체크 제약조건 추가
DO $$
BEGIN
    -- 기존 제약조건이 있다면 삭제
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_role_check'
    ) THEN
        ALTER TABLE users DROP CONSTRAINT users_role_check;
    END IF;
    
    -- 새로운 제약조건 추가
    ALTER TABLE users 
    ADD CONSTRAINT users_role_check 
    CHECK (role IN ('student', 'admin'));
END $$;

-- 4. 기존 사용자들의 role을 기본값으로 설정
UPDATE users 
SET role = 'student' 
WHERE role IS NULL;

-- 5. 최종 테이블 구조 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND table_schema = 'public'
ORDER BY ordinal_position;

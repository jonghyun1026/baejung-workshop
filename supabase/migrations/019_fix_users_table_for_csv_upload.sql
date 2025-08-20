-- CSV 업로드를 위한 users 테이블 완전 수정

-- 1. 기존 테이블 백업 (혹시 모를 상황 대비)
-- CREATE TABLE users_backup AS SELECT * FROM users;

-- 2. 누락된 컬럼들 추가 (컬럼명을 CSV와 정확히 일치시킴)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS program VARCHAR(200),
ADD COLUMN IF NOT EXISTS status VARCHAR(50),
ADD COLUMN IF NOT EXISTS ws_group VARCHAR(100),
ADD COLUMN IF NOT EXISTS "2nd_term_group" VARCHAR(100), -- 따옴표로 감싸서 숫자 시작 허용
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS attendance VARCHAR(50);

-- 3. NOT NULL 제약조건 제거 (CSV에 없는 컬럼들)
ALTER TABLE users 
ALTER COLUMN birth_date DROP NOT NULL,
ALTER COLUMN location DROP NOT NULL,
ALTER COLUMN mbti DROP NOT NULL;

-- 4. 기본값 설정 (데이터 무결성을 위해)
ALTER TABLE users 
ALTER COLUMN birth_date SET DEFAULT NULL,
ALTER COLUMN location SET DEFAULT NULL,
ALTER COLUMN mbti SET DEFAULT NULL;

-- 5. 확인용 쿼리 (실행 후 결과 확인)
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' 
-- ORDER BY ordinal_position; 
-- role 컬럼의 CHECK 제약조건 제거
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- role 컬럼을 더 유연하게 변경 (필요시)
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'student';

-- 확인용: 현재 제약조건 조회
-- SELECT conname, contype, consrc 
-- FROM pg_constraint 
-- WHERE conrelid = 'users'::regclass; 
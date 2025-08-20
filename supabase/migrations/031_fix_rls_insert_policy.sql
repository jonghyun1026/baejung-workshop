-- RLS 정책 수정 - 사용자가 자신의 데이터를 생성할 수 있도록 허용

-- 1. 기존 users 테이블 INSERT 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users' AND cmd = 'INSERT';

-- 2. 기존 INSERT 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- 3. 새로운 INSERT 정책 생성 - 로그인한 사용자가 자신의 데이터를 생성할 수 있도록
CREATE POLICY "Users can insert own data" ON users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 4. 기존 UPDATE 정책도 확인하고 수정
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Users can update own profile" ON users 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. 현재 정책 상태 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY cmd, policyname;



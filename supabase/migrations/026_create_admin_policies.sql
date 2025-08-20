-- 관리자 권한 정책 추가

-- 기존 notices 정책 삭제 (필요시)
DROP POLICY IF EXISTS "Anyone can view notices" ON notices;

-- 새로운 notices 정책 생성
CREATE POLICY "Anyone can view notices" ON notices FOR SELECT USING (true);

-- 관리자만 공지사항 관리 가능
CREATE POLICY "Admins can insert notices" ON notices 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can update notices" ON notices 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can delete notices" ON notices 
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- 관리자 역할 확인을 위한 함수 생성
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

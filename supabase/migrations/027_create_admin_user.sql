-- 관리자 계정 생성 및 설정
-- 이 마이그레이션은 기본 관리자 계정을 생성합니다

-- 특정 이메일 주소를 관리자로 설정하는 함수
CREATE OR REPLACE FUNCTION set_user_as_admin(user_email text)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET role = 'admin' 
  WHERE email = user_email;
  
  -- 결과 확인
  IF NOT FOUND THEN
    RAISE NOTICE '해당 이메일의 사용자를 찾을 수 없습니다: %', user_email;
  ELSE
    RAISE NOTICE '사용자가 관리자로 설정되었습니다: %', user_email;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 관리자 목록 조회 함수
CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS TABLE(id uuid, email text, name text, role text, created_at timestamptz) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.name, u.role, u.created_at
  FROM users u
  WHERE u.role = 'admin'
  ORDER BY u.created_at;
END;
$$ LANGUAGE plpgsql;

-- 사용 예시 (실제 이메일로 변경 필요):
-- SELECT set_user_as_admin('admin@example.com');
-- SELECT * FROM get_admin_users();

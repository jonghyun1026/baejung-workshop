-- 관리자 권한 부여 및 관리 함수들

-- 1. 이름으로 사용자를 관리자로 설정
CREATE OR REPLACE FUNCTION set_admin_by_name(user_name text)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET role = 'admin' 
  WHERE name = user_name;
  
  IF NOT FOUND THEN
    RAISE NOTICE '해당 이름의 사용자를 찾을 수 없습니다: %', user_name;
  ELSE
    RAISE NOTICE '사용자가 관리자로 설정되었습니다: %', user_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 2. 사용자 ID로 관리자로 설정
CREATE OR REPLACE FUNCTION set_admin_by_id(user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET role = 'admin' 
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE NOTICE '해당 ID의 사용자를 찾을 수 없습니다: %', user_id;
  ELSE
    RAISE NOTICE '사용자가 관리자로 설정되었습니다: %', user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. 모든 사용자 목록 조회 (관리자 권한 부여용)
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE(id uuid, name text, school text, role text, created_at timestamptz) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.name, u.school, u.role, u.created_at
  FROM users u
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 4. 관리자 목록 조회
CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS TABLE(id uuid, name text, school text, role text, created_at timestamptz) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.name, u.school, u.role, u.created_at
  FROM users u
  WHERE u.role = 'admin'
  ORDER BY u.created_at;
END;
$$ LANGUAGE plpgsql;

-- 5. 사용자를 일반 권한으로 되돌리기
CREATE OR REPLACE FUNCTION remove_admin_by_name(user_name text)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET role = 'student' 
  WHERE name = user_name AND role = 'admin';
  
  IF NOT FOUND THEN
    RAISE NOTICE '해당 이름의 관리자를 찾을 수 없습니다: %', user_name;
  ELSE
    RAISE NOTICE '관리자 권한이 제거되었습니다: %', user_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

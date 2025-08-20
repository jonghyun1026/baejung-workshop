-- RLS를 우회하여 관리자 권한을 부여하는 함수들

-- 1. 현재 사용자를 관리자로 만드는 함수 (SECURITY DEFINER로 RLS 우회)
CREATE OR REPLACE FUNCTION make_current_user_admin()
RETURNS json AS $$
DECLARE
    current_user_id uuid;
    user_email text;
    user_name text;
    result json;
BEGIN
    -- 현재 로그인한 사용자 ID 가져오기
    SELECT auth.uid() INTO current_user_id;
    
    IF current_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', '로그인이 필요합니다');
    END IF;
    
    -- auth.users에서 사용자 정보 가져오기
    SELECT 
        email,
        COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', email)
    INTO user_email, user_name
    FROM auth.users 
    WHERE id = current_user_id;
    
    -- users 테이블에 데이터 삽입 또는 업데이트 (SECURITY DEFINER로 RLS 우회)
    INSERT INTO users (id, name, school, major, role, created_at)
    VALUES (
        current_user_id,
        COALESCE(user_name, user_email, '관리자'),
        '시스템',
        '관리자',
        'admin',
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'admin',
        updated_at = NOW();
    
    -- 결과 반환
    SELECT json_build_object(
        'success', true,
        'message', '관리자 권한이 부여되었습니다',
        'user_id', current_user_id,
        'email', user_email,
        'name', user_name
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 현재 사용자 정보를 동기화하는 함수
CREATE OR REPLACE FUNCTION sync_current_user()
RETURNS json AS $$
DECLARE
    current_user_id uuid;
    user_email text;
    user_name text;
    result json;
BEGIN
    -- 현재 로그인한 사용자 ID 가져오기
    SELECT auth.uid() INTO current_user_id;
    
    IF current_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', '로그인이 필요합니다');
    END IF;
    
    -- auth.users에서 사용자 정보 가져오기
    SELECT 
        email,
        COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', email)
    INTO user_email, user_name
    FROM auth.users 
    WHERE id = current_user_id;
    
    -- users 테이블에 데이터 삽입 (기본 권한: student)
    INSERT INTO users (id, name, school, major, role, created_at)
    VALUES (
        current_user_id,
        COALESCE(user_name, user_email, '사용자'),
        '미설정',
        '미설정',
        'student',
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, users.name),
        updated_at = NOW();
    
    -- 결과 반환
    SELECT json_build_object(
        'success', true,
        'message', '사용자 데이터가 동기화되었습니다',
        'user_id', current_user_id,
        'email', user_email,
        'name', user_name
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 현재 사용자의 역할 확인 함수
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS json AS $$
DECLARE
    current_user_id uuid;
    user_role text;
    user_data record;
    result json;
BEGIN
    -- 현재 로그인한 사용자 ID 가져오기
    SELECT auth.uid() INTO current_user_id;
    
    IF current_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', '로그인이 필요합니다');
    END IF;
    
    -- users 테이블에서 사용자 정보 가져오기
    SELECT id, name, role INTO user_data
    FROM users 
    WHERE id = current_user_id;
    
    IF user_data.id IS NULL THEN
        RETURN json_build_object(
            'success', false, 
            'message', '사용자 데이터가 없습니다',
            'user_id', current_user_id
        );
    END IF;
    
    -- 결과 반환
    SELECT json_build_object(
        'success', true,
        'message', '사용자 역할 확인 완료',
        'user_id', current_user_id,
        'name', user_data.name,
        'role', user_data.role,
        'is_admin', user_data.role = 'admin'
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;



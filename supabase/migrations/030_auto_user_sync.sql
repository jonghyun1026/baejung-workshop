-- 로그인 시 자동으로 users 테이블에 사용자 정보 동기화

-- 1. 사용자 자동 생성/업데이트 함수
CREATE OR REPLACE FUNCTION sync_user_data()
RETURNS void AS $$
DECLARE
    auth_user_id uuid;
    auth_user_email text;
    auth_user_name text;
BEGIN
    -- 현재 로그인한 사용자 정보 가져오기
    SELECT auth.uid() INTO auth_user_id;
    
    IF auth_user_id IS NULL THEN
        RETURN; -- 로그인하지 않은 경우
    END IF;
    
    -- auth.users에서 사용자 정보 가져오기
    SELECT 
        email,
        COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', email)
    INTO auth_user_email, auth_user_name
    FROM auth.users 
    WHERE id = auth_user_id;
    
    -- users 테이블에 삽입 또는 업데이트
    INSERT INTO users (id, name, school, major, role)
    VALUES (
        auth_user_id,
        COALESCE(auth_user_name, auth_user_email, '이름 없음'),
        '미설정',
        '미설정',
        'student'
    )
    ON CONFLICT (id) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, users.name),
        updated_at = NOW()
    WHERE users.name IS NULL OR users.name = '';
    
    RAISE NOTICE '사용자 데이터 동기화 완료: %', auth_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RPC 함수로 클라이언트에서 호출 가능하게 만들기
CREATE OR REPLACE FUNCTION sync_current_user()
RETURNS json AS $$
DECLARE
    result json;
    auth_user_id uuid;
BEGIN
    SELECT auth.uid() INTO auth_user_id;
    
    IF auth_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', '로그인이 필요합니다');
    END IF;
    
    -- 동기화 실행
    PERFORM sync_user_data();
    
    -- 결과 반환
    SELECT json_build_object(
        'success', true,
        'message', '사용자 데이터 동기화 완료',
        'user_id', auth_user_id
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 현재 로그인한 사용자를 관리자로 설정하는 함수
CREATE OR REPLACE FUNCTION make_me_admin()
RETURNS json AS $$
DECLARE
    result json;
    auth_user_id uuid;
    user_exists boolean;
BEGIN
    SELECT auth.uid() INTO auth_user_id;
    
    IF auth_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', '로그인이 필요합니다');
    END IF;
    
    -- 먼저 사용자 데이터 동기화
    PERFORM sync_user_data();
    
    -- 관리자 권한 부여
    UPDATE users 
    SET role = 'admin' 
    WHERE id = auth_user_id;
    
    -- 결과 확인
    SELECT EXISTS(SELECT 1 FROM users WHERE id = auth_user_id AND role = 'admin') 
    INTO user_exists;
    
    IF user_exists THEN
        SELECT json_build_object(
            'success', true,
            'message', '관리자 권한이 부여되었습니다',
            'user_id', auth_user_id
        ) INTO result;
    ELSE
        SELECT json_build_object(
            'success', false,
            'message', '관리자 권한 부여에 실패했습니다'
        ) INTO result;
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

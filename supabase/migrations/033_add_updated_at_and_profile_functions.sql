-- users 테이블에 updated_at 컬럼 추가 및 프로필 이미지 업데이트 함수 생성
-- 이 마이그레이션은 프로필 이미지 업로드 오류를 해결합니다:
-- Error: column "updated_at" of relation "users" does not exist

-- 1. users 테이블에 updated_at 컬럼 추가 (없는 경우에만)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. updated_at 컬럼을 자동으로 업데이트하는 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. users 테이블에 트리거 생성 (이미 있으면 무시)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. 기존 함수 삭제 (있다면)
DROP FUNCTION IF EXISTS update_user_profile_image(UUID, TEXT);

-- 5. 프로필 이미지 업데이트 RPC 함수 생성
CREATE OR REPLACE FUNCTION update_user_profile_image(
    p_user_id UUID,
    p_profile_image_url TEXT
)
RETURNS TABLE(
    id UUID,
    name VARCHAR(100),
    school VARCHAR(200),
    major VARCHAR(200),
    profile_image_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 사용자 프로필 이미지 URL 업데이트
    UPDATE users 
    SET 
        profile_image_url = p_profile_image_url,
        updated_at = NOW()
    WHERE users.id = p_user_id;
    
    -- 업데이트된 사용자 정보 반환
    RETURN QUERY
    SELECT 
        users.id,
        users.name,
        users.school,
        users.major,
        users.profile_image_url,
        users.updated_at
    FROM users 
    WHERE users.id = p_user_id;
END;
$$;

-- 6. RLS 정책에 대한 보안 설정 (필요한 경우)
-- 이미 설정된 RLS 정책이 RPC 함수에도 적용됩니다.

-- 7. 기존 users 테이블의 updated_at 컬럼을 현재 시간으로 초기화
UPDATE users 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

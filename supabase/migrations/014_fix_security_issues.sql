-- Rooms 테이블에 RLS 활성화
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Rooms 테이블 정책 (관리자만 접근 가능)
CREATE POLICY "Only admins can manage rooms" ON rooms FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id::text = auth.uid()::text 
    AND users.role = 'admin'
  )
);

-- 함수의 search_path를 명시적으로 설정
CREATE OR REPLACE FUNCTION update_photo_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public;
  IF TG_OP = 'INSERT' THEN
    UPDATE photos SET likes_count = likes_count + 1 WHERE id = NEW.photo_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE photos SET likes_count = likes_count - 1 WHERE id = OLD.photo_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
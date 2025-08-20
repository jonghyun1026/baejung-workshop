-- 좋아요 카운트를 자동으로 업데이트하는 함수
CREATE OR REPLACE FUNCTION update_photo_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE photos SET likes_count = likes_count + 1 WHERE id = NEW.photo_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE photos SET likes_count = likes_count - 1 WHERE id = OLD.photo_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER trigger_update_photo_likes_count
  AFTER INSERT OR DELETE ON photo_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_photo_likes_count(); 
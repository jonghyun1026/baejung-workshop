-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE introductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Users 테이블 정책
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Introductions 테이블 정책
CREATE POLICY "Users can view all introductions" ON introductions FOR SELECT USING (true);
CREATE POLICY "Users can insert own introduction" ON introductions FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own introduction" ON introductions FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Photos 테이블 정책
CREATE POLICY "Users can view all photos" ON photos FOR SELECT USING (true);
CREATE POLICY "Users can insert own photos" ON photos FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own photos" ON photos FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own photos" ON photos FOR DELETE USING (auth.uid()::text = user_id::text);

-- Photo Likes 테이블 정책
CREATE POLICY "Users can view all photo likes" ON photo_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON photo_likes FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own likes" ON photo_likes FOR DELETE USING (auth.uid()::text = user_id::text);

-- Room Assignments 테이블 정책
CREATE POLICY "Users can view own room assignment" ON room_assignments FOR SELECT USING (auth.uid()::text = user_id::text);

-- Surveys 테이블 정책
CREATE POLICY "Users can insert own survey" ON surveys FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can view own survey" ON surveys FOR SELECT USING (auth.uid()::text = user_id::text);

-- Public tables (모든 사용자가 읽기 가능)
CREATE POLICY "Anyone can view notices" ON notices FOR SELECT USING (true);
CREATE POLICY "Anyone can view faq" ON faq FOR SELECT USING (true);
CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (true); 
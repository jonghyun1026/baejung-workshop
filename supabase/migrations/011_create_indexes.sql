-- Users 테이블 인덱스
CREATE INDEX idx_users_school ON users(school);
CREATE INDEX idx_users_major ON users(major);
CREATE INDEX idx_users_mbti ON users(mbti);
CREATE INDEX idx_users_role ON users(role);

-- Room Assignments 인덱스
CREATE INDEX idx_room_assignments_user_id ON room_assignments(user_id);
CREATE INDEX idx_room_assignments_room_id ON room_assignments(room_id);

-- Photos 인덱스
CREATE INDEX idx_photos_user_id ON photos(user_id);
CREATE INDEX idx_photos_uploaded_at ON photos(uploaded_at DESC);

-- Photo Likes 인덱스
CREATE INDEX idx_photo_likes_photo_id ON photo_likes(photo_id);
CREATE INDEX idx_photo_likes_user_id ON photo_likes(user_id);

-- Events 인덱스
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_start_time ON events(start_time);

-- Notices 인덱스
CREATE INDEX idx_notices_created_at ON notices(created_at DESC);
CREATE INDEX idx_notices_is_important ON notices(is_important);

-- FAQ 인덱스
CREATE INDEX idx_faq_category ON faq(category);
CREATE INDEX idx_faq_order_index ON faq(order_index); 
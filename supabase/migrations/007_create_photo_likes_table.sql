CREATE TABLE photo_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(photo_id, user_id)
); 
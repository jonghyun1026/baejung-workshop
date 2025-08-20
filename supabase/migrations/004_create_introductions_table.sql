CREATE TABLE introductions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  keywords TEXT NOT NULL,
  interests TEXT NOT NULL,
  bucketlist TEXT NOT NULL,
  stress_relief TEXT NOT NULL,
  foundation_activity TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
); 
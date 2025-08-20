CREATE TABLE surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  satisfaction_score INTEGER NOT NULL CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
  feedback_text TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
); 
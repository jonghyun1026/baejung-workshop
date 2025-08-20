CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  school VARCHAR(200) NOT NULL,
  major VARCHAR(200) NOT NULL,
  birth_date DATE NOT NULL,
  location VARCHAR(100) NOT NULL,
  mbti VARCHAR(10) NOT NULL,
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
); 
-- 자기소개 테이블에 개인정보 컬럼 추가
-- 2025-08-12: 이름, 학교, 전공, 생년월일, 사는 곳, MBTI 컬럼 추가

-- introductions 테이블에 새 컬럼들 추가
ALTER TABLE introductions 
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS school VARCHAR(255),
ADD COLUMN IF NOT EXISTS major VARCHAR(255),
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS mbti VARCHAR(10);

-- 컬럼에 설명 추가
COMMENT ON COLUMN introductions.name IS '사용자 이름';
COMMENT ON COLUMN introductions.school IS '학교명';
COMMENT ON COLUMN introductions.major IS '전공';
COMMENT ON COLUMN introductions.birth_date IS '생년월일';
COMMENT ON COLUMN introductions.location IS '거주지';
COMMENT ON COLUMN introductions.mbti IS 'MBTI 성격유형';

-- MBTI 값에 대한 체크 제약조건 추가 (선택사항)
ALTER TABLE introductions 
ADD CONSTRAINT introductions_mbti_check 
CHECK (mbti IS NULL OR mbti ~ '^[EI][SN][TF][JP]$');





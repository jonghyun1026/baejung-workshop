# 🗃️ ERD: DB 스키마 설계

## Users
- id (PK)
- name
- school
- major
- birth_date
- location
- mbti
- role (student / admin)
- created_at

## Introductions
- id (PK)
- user_id (FK → Users.id)
- keywords (TEXT)  -- 쉼표 구분
- interests (TEXT)
- bucketlist (TEXT)
- stress_relief (TEXT)
- foundation_activity (TEXT)
- submitted_at

## Photos
- id (PK)
- user_id (FK → Users.id)
- image_url
- uploaded_at
- likes_count

## Rooms
- id (PK)
- room_number
- building_name
- capacity

## Room_Assignments
- id (PK)
- user_id (FK → Users.id)
- room_id (FK → Rooms.id)

## Surveys
- id (PK)
- user_id (FK → Users.id)
- satisfaction_score
- feedback_text
- submitted_at

# 🏆 OK배·정장학재단 2025 하반기 워크숍 웹페이지

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

**20250823-24 배정장학재단 워크숍 전용 웹사이트**

OK배·정장학재단 2025년 하반기 장학생 워크숍을 위한 공식 행사 웹페이지입니다.  
장학생들이 행사 정보를 쉽고 빠르게 확인하고, 자기소개를 등록하며, 사진을 공유할 수 있는 통합 플랫폼입니다.

## 🚀 주요 기능

### 📱 사용자 기능
- **행사 일정표**: 워크숍 세부 일정 및 위치 정보 제공
- **자기소개 등록**: 개인 정보 및 프로필 작성/수정
- **참석자 디렉토리**: 참가자 목록 및 프로필 검색
- **숙소 배정 조회**: 객실 정보, 위치, 동숙자 확인
- **사진첩 기능**: 사진 업로드 및 좋아요 기능
- **공지사항 & FAQ**: 행사 관련 정보 제공

### 🔧 관리자 기능
- **공지사항 관리**: 공지사항 작성, 수정, 삭제
- **사용자 관리**: 참가자 정보 확인 및 관리
- **권한 관리**: 관리자 권한 설정 및 관리

## 🛠 기술 스택

### Frontend
- **Next.js 15.1** - React 기반 풀스택 프레임워크
- **React 19** - 사용자 인터페이스 라이브러리
- **TypeScript** - 타입 안전성 보장
- **Tailwind CSS** - 유틸리티 기반 CSS 프레임워크
- **Shadcn UI** - 모던하고 접근 가능한 UI 컴포넌트

### Backend & Database
- **Supabase** - 백엔드 서비스 (PostgreSQL, 인증, 스토리지)
- **PostgreSQL** - 관계형 데이터베이스

### 주요 라이브러리
- **@tanstack/react-query** - 서버 상태 관리
- **react-hook-form** - 폼 상태 관리 및 유효성 검사
- **zustand** - 클라이언트 상태 관리
- **zod** - 스키마 유효성 검사
- **lucide-react** - 아이콘 라이브러리
- **date-fns** - 날짜 유틸리티
- **bcryptjs** - 비밀번호 암호화

## 🏗 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── admin/             # 관리자 전용 페이지
│   ├── auth/              # 인증 페이지
│   ├── directory/         # 참석자 디렉토리
│   ├── photos/            # 사진첩
│   ├── profile/           # 프로필 페이지
│   └── rooms/             # 숙소 배정
├── components/            # 재사용 가능한 컴포넌트
│   ├── auth/              # 인증 관련 컴포넌트
│   └── ui/                # Shadcn UI 컴포넌트
├── features/              # 기능별 모듈
│   ├── admin/             # 관리자 기능
│   ├── events/            # 이벤트 관리
│   ├── photos/            # 사진 기능
│   └── users/             # 사용자 관리
├── hooks/                 # React 커스텀 훅
├── lib/                   # 유틸리티 및 설정
└── constants/             # 상수 정의
```

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd 0725new
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 변수들을 설정합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인할 수 있습니다.

### 5. 빌드 및 배포
```bash
npm run build
npm run start
```

## 🗄 데이터베이스 구조

### 주요 테이블
- **users**: 사용자 정보 (이름, 학교, 전공, 연락처 등)
- **notices**: 공지사항
- **photos**: 사진 정보
- **photo_likes**: 사진 좋아요
- **rooms**: 숙소 정보
- **room_assignments**: 숙소 배정
- **events**: 행사 일정
- **introductions**: 자기소개

## 🔐 인증 시스템

- **Directory 기반 인증**: 이름과 전화번호를 통한 사용자 인증
- **로컬 스토리지**: 클라이언트 사이드 세션 관리
- **역할 기반 접근 제어**: `admin`, `student` 역할 지원

## 🎨 UI/UX 특징

- **반응형 디자인**: 모바일 우선 설계
- **다크/라이트 테마**: 사용자 선호에 따른 테마 지원
- **접근성**: WCAG 가이드라인 준수
- **로딩 상태**: 사용자 경험 향상을 위한 로딩 인디케이터

## 📝 개발 가이드라인

### 코드 스타일
- **ESLint**: 코드 품질 관리
- **TypeScript**: 타입 안전성 보장
- **함수형 프로그래밍**: 순수 함수 및 불변성 원칙
- **컴포넌트 분리**: 재사용 가능한 모듈식 설계

### 성능 최적화
- **React Query**: 서버 상태 캐싱 및 최적화
- **Lazy Loading**: 필요시에만 컴포넌트 로드
- **Image Optimization**: Next.js Image 컴포넌트 활용

## 🤝 기여 방법

1. 이슈 등록 또는 기능 제안
2. 브랜치 생성 (`feature/new-feature`)
3. 변경사항 커밋
4. 테스트 실행 및 확인
5. Pull Request 생성

## 📄 라이선스

이 프로젝트는 OK배·정장학재단의 내부 프로젝트입니다.

## 🙋‍♂️ 문의

프로젝트 관련 문의사항이 있으시면 관리자에게 연락해주세요.

---

**OK배·정장학재단** | 2025 하반기 워크숍

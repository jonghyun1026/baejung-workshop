# 웹사이트 폰트 변경 가이드

## 현재 적용된 폰트
- **기본 폰트**: Noto Sans KR (한글 최적화)
- **영문 폰트**: Inter (보조)

## 다른 폰트 옵션

### 1. Pretendard (한국에서 개발된 폰트)
```tsx
// src/app/layout.tsx
import localFont from 'next/font/local'

const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  weight: '100 900',
})
```

### 2. IBM Plex Sans KR
```tsx
import { IBM_Plex_Sans_KR } from 'next/font/google'

const ibmPlex = IBM_Plex_Sans_KR({
  variable: '--font-ibm-plex',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})
```

### 3. Source Sans Pro
```tsx
import { Source_Sans_Pro } from 'next/font/google'

const sourceSans = Source_Sans_Pro({
  variable: '--font-source-sans',
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
})
```

## 폰트 변경 방법

### 1단계: layout.tsx 수정
- `src/app/layout.tsx`에서 폰트 import와 설정 변경

### 2단계: Tailwind 설정 업데이트
- `tailwind.config.ts`의 fontFamily 섹션 수정

### 3단계: CSS 업데이트
- `src/app/globals.css`의 기본 폰트 설정 변경

## 현재 사용 가능한 폰트 클래스

```css
font-noto      /* Noto Sans KR */
font-inter     /* Inter */
font-sans      /* 기본 sans-serif stack */
```

## 예시 사용법

```tsx
<h1 className="font-noto text-2xl font-bold">한글 제목</h1>
<p className="font-inter text-base">English text</p>
<span className="font-sans">기본 폰트</span>
```

## 웹 폰트 최적화 팁

1. **font-display: swap** - 폰트 로딩 중 fallback 폰트 사용
2. **subset 최적화** - 필요한 문자셋만 로드
3. **weight 선택** - 필요한 굵기만 포함
4. **preload** - 중요한 폰트는 미리 로딩

## 변경 완료된 파일들

- ✅ `src/app/layout.tsx` - 폰트 import 및 적용
- ✅ `tailwind.config.ts` - Tailwind 폰트 설정
- ✅ `src/app/globals.css` - 기본 폰트 스타일
- ✅ `src/app/page.tsx` - 홈페이지 폰트 클래스 적용





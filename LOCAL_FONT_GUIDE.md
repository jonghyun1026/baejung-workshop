# 로컬 폰트 파일 업로드 및 사용 가이드

## 📁 폰트 파일 업로드 위치

로컬 폰트 파일은 다음 폴더에 업로드하세요:
```
public/fonts/
├── YourFont.woff2    (권장 - 최신 브라우저)
├── YourFont.woff     (구형 브라우저 지원)
├── YourFont.ttf      (시스템 폰트용)
└── YourFont.otf      (OpenType 폰트)
```

## 🔧 로컬 폰트 설정 방법

### 1단계: 폰트 파일 준비
- **WOFF2**: 최고 압축률, 모던 브라우저 (권장)
- **WOFF**: 구형 브라우저 지원용
- **TTF/OTF**: 원본 폰트 파일

### 2단계: layout.tsx에서 로컬 폰트 설정
```tsx
import localFont from 'next/font/local'

// 단일 폰트 파일 사용
const myCustomFont = localFont({
  src: './fonts/MyFont.woff2',
  variable: '--font-custom',
  display: 'swap',
})

// 여러 굵기 폰트 파일 사용
const myVariableFont = localFont({
  src: [
    {
      path: './fonts/MyFont-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/MyFont-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/MyFont-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-custom',
  display: 'swap',
})

// Variable Font 사용 (추천)
const myVariableFont = localFont({
  src: './fonts/MyFont-Variable.woff2',
  variable: '--font-custom',
  weight: '100 900', // Variable font의 전체 weight 범위
  display: 'swap',
})
```

### 3단계: Tailwind 설정 업데이트
```typescript
// tailwind.config.ts
extend: {
  fontFamily: {
    'custom': ['var(--font-custom)', 'sans-serif'],
    'sans': ['var(--font-custom)', 'system-ui', 'sans-serif'],
  },
}
```

### 4단계: CSS에서 기본 폰트 적용
```css
/* globals.css */
html {
  font-family: var(--font-custom), system-ui, sans-serif;
}
```

## 📋 지원하는 폰트 파일 형식

| 형식 | 파일 확장자 | 브라우저 지원 | 권장도 |
|------|-------------|---------------|--------|
| WOFF2 | .woff2 | 모던 브라우저 | ⭐⭐⭐⭐⭐ |
| WOFF | .woff | 대부분 브라우저 | ⭐⭐⭐⭐ |
| TTF | .ttf | 모든 브라우저 | ⭐⭐⭐ |
| OTF | .otf | 모든 브라우저 | ⭐⭐⭐ |

## 🎯 사용 예시

### 한국 폰트 예시
```tsx
// Pretendard 폰트 사용
const pretendard = localFont({
  src: [
    {
      path: './fonts/Pretendard-Light.woff2',
      weight: '300',
    },
    {
      path: './fonts/Pretendard-Regular.woff2',
      weight: '400',
    },
    {
      path: './fonts/Pretendard-Bold.woff2',
      weight: '700',
    },
  ],
  variable: '--font-pretendard',
  display: 'swap',
})
```

### 영문 폰트 예시
```tsx
// Custom 영문 폰트
const customFont = localFont({
  src: './fonts/CustomFont-Variable.woff2',
  variable: '--font-custom',
  weight: '100 900',
  display: 'swap',
})
```

## 🔧 현재 설정에 로컬 폰트 추가하기

기존 Noto Sans KR 설정에 로컬 폰트를 추가하려면:

```tsx
import { Noto_Sans_KR } from 'next/font/google'
import localFont from 'next/font/local'

// 기존 Google 폰트
const notoSansKR = Noto_Sans_KR({ ... })

// 새로운 로컬 폰트
const customFont = localFont({
  src: './fonts/YourFont.woff2',
  variable: '--font-custom',
  display: 'swap',
})

// body에 두 폰트 모두 적용
<body className={`${notoSansKR.variable} ${customFont.variable} font-custom`}>
```

## 📱 실제 적용 예시

```tsx
{/* 로컬 폰트 사용 */}
<h1 className="font-custom text-2xl font-bold">
  커스텀 폰트 제목
</h1>

{/* Google 폰트와 로컬 폰트 혼용 */}
<p className="font-noto text-base">구글 폰트 텍스트</p>
<p className="font-custom text-base">로컬 폰트 텍스트</p>
```

## ⚡ 성능 최적화 팁

1. **WOFF2 우선 사용**: 최고 압축률
2. **font-display: swap**: 로딩 중에도 텍스트 표시
3. **preload 설정**: 중요한 폰트는 미리 로드
4. **서브셋 생성**: 필요한 글자만 포함한 폰트 파일 생성

## 🚀 폰트 파일 업로드 후 할 일

1. `public/fonts/` 폴더에 폰트 파일 업로드
2. `src/app/layout.tsx`에서 localFont 설정
3. `tailwind.config.ts`에 폰트 패밀리 추가
4. 필요시 `globals.css`에서 기본 폰트 변경
5. 컴포넌트에서 `font-custom` 클래스 사용

## 📞 문의사항

폰트 파일을 업로드하신 후 위 가이드에 따라 설정해주시면, 커스텀 폰트를 웹사이트에 적용할 수 있습니다!





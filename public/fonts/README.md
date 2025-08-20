# 폰트 파일 업로드 폴더

이 폴더에 사용하고 싶은 폰트 파일을 업로드하세요.

## 지원하는 파일 형식
- `.woff2` (권장 - 최고 압축률)
- `.woff` (구형 브라우저 지원)
- `.ttf` (TrueType 폰트)
- `.otf` (OpenType 폰트)

## 업로드 방법
1. 이 폴더에 폰트 파일 복사
2. `src/app/layout.tsx`에서 주석 처리된 로컬 폰트 설정 해제
3. 파일 경로와 폰트 이름 수정
4. `tailwind.config.ts`에서 해당 폰트 클래스 활성화

## 예시 파일 구조
```
public/fonts/
├── MyFont-Regular.woff2
├── MyFont-Bold.woff2
├── MyFont-Light.woff2
└── MyFont-Variable.woff2
```

자세한 설정 방법은 `LOCAL_FONT_GUIDE.md` 파일을 참고하세요!





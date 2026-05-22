# 학부모 상담 예약실

고등학교 학부모 상담 예약 웹앱입니다.

## 기술 스택

- React 18 + Vite
- React Router v6 (URL 기반 라우팅)
- localStorage (데이터 저장, 추후 Supabase 전환 가능)
- 순수 CSS (Tailwind 미사용, 인라인 스타일)

## 폴더 구조

```
src/
  App.jsx                  # 라우터 설정 (/, /admin/login, /admin)
  main.jsx
  index.css
  pages/
    ParentReservationPage.jsx   # 학부모 예약 페이지 (/)
    AdminLoginPage.jsx          # 관리자 로그인 (/admin/login)
    AdminPage.jsx               # 관리자 대시보드 (/admin)
  components/
    SlotCard.jsx                # 상담 시간 카드
    ReservationForm.jsx         # 예약 입력 폼 모달
    ReservationList.jsx         # 관리자용 예약 목록
  data/
    initialSlots.js             # 6월 상담 초기 데이터
  services/
    storageService.js           # 데이터 CRUD (localStorage → Supabase 전환 가능)
```

## 실행 방법

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev

# 3. 브라우저에서 열기
# 학부모 페이지: http://localhost:5173/
# 관리자 페이지: http://localhost:5173/admin
```

## 관리자 비밀번호

기본값: `admin1234`

변경 방법 1 — 코드에서 직접 수정:
`src/pages/AdminLoginPage.jsx` 상단의 `ADMIN_PASSWORD` 값을 바꾸세요.

변경 방법 2 — 환경변수 (권장):
프로젝트 루트에 `.env` 파일 생성 후:
```
VITE_ADMIN_PASSWORD=새비밀번호
```

> ⚠️ 현재 비밀번호 방식은 **임시 보안**입니다.
> 실제 운영 시에는 Supabase Auth 또는 Firebase Auth로 교체하세요.

## Vercel 배포

```bash
# 1. 빌드
npm run build

# 2. Vercel CLI 배포
npx vercel --prod
```

또는 GitHub에 push 후 Vercel 대시보드에서 연결하면 자동 배포됩니다.
`vercel.json`에 SPA 라우팅 설정이 포함되어 있어 `/admin` 직접 접속도 정상 작동합니다.

## Supabase 전환 방법

1. `npm install @supabase/supabase-js`
2. `src/services/supabaseClient.js` 생성 후 `createClient` 초기화
3. `src/services/storageService.js`의 각 함수를 Supabase 쿼리로 교체
   - `getAllSlots()` → `supabase.from('slots').select('*')`
   - `addReservation()` → `supabase.from('reservations').insert(...)`
   - 등등

## 사용 방법

1. 학부모는 `/` 접속 → 캘린더에서 날짜 선택 → 시간 카드에서 예약하기 클릭 → 폼 입력 → 완료
2. 교사(관리자)는 `/admin` 접속 → 비밀번호 입력 → 날짜별 예약 현황 확인 → 상담 완료 처리 또는 취소

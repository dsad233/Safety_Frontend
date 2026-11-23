# safety frontend

React와 TypeScript로 만든 파일 보관 서비스의 프런트엔드입니다.

```text
src/
├── assets/                 # 이미지와 SVG 등 정적 리소스
├── common/
│   ├── account/            # 계정 API, 타입, 세션, 검증 상수와 응답 처리
│   ├── storage/            # 파일 API, 페이지 조회 훅, 타입과 유틸리티
│   └── navigation.ts       # 화면 구분 타입과 URL 처리
├── components/
│   ├── account/            # 계정 화면의 공통 레이아웃
│   ├── storage/            # 사이드바, 파일 목록, 페이지 이동, 메뉴와 모달
│   └── Toast.tsx           # 공통 알림
├── pages/                  # 홈, 로그인, 회원가입, 마이페이지, 파일 보관함
├── styles/                 # 공통·계정·홈·파일 보관함 CSS
├── App.tsx                 # 진입 화면 분기
└── main.tsx                # React와 스타일 진입점
```

페이지의 상태와 API 연동은 `pages`, UI 구성요소는 `components`, 공통 API 요청과 로직·타입은 `common`에 둡니다. 스타일은 `styles/index.css`에서 모아 불러옵니다.

마이페이지는 액세스 토큰을 `Authorization: Bearer <accessToken>` 헤더에 담아 `GET /api/users/mypage`를 호출하고, 응답의 `data`에 있는 `nickname`, `email`, `loginId`를 표시합니다.

파일 목록은 `GET /api/files?page=1&pages=10`처럼 `page`에 현재 페이지, `pages`에 페이지당 항목 수를 전달합니다. 기본값은 10개이며 20개·50개로 바꿀 수 있습니다. 검색·필터·정렬·폴더 또는 표시 개수를 바꾸면 1페이지부터 다시 조회합니다. 전체 개수가 없는 응답에 맞춰 이전·다음으로 이동하며, 빈 다음 페이지가 반환되면 현재 목록을 유지하고 다음 이동을 비활성화합니다.

파일 다운로드는 `POST /api/files/download`에 `Authorization: Bearer <accessToken>` 헤더와 `{ "ids": ["선택한 파일 ID"] }` 본문을 보냅니다. 응답 `data.buffer`의 Base64 문자열을 바이너리로 복원해 Blob URL로 내려받으며, 파일명과 확장자는 선택한 목록 항목을 사용합니다. 다운로드를 시작한 뒤 임시 링크와 URL을 정리합니다.

```sh
pnpm install
pnpm dev
pnpm build
pnpm lint
```

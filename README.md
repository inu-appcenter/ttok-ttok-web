# 똑똑(TTOK-TTOK) Web

> 인천대학교 연구실 정보 서비스 **똑똑(TTOK-TTOK)**의 프론트엔드 저장소입니다.
>
> 현재 정보기술대학을 대상으로 1단계 MVP를 개발하고 있으며, 기능과 정책은 검증 결과에 따라 변경될 수 있습니다.

## 서비스 소개

똑똑(TTOK-TTOK)은 인천대학교 학부생이 교내 연구실을 탐색하고 학부연구생 모집 정보를 확인할 수 있도록 돕는 서비스입니다.

연구실의 연구 주제와 모집 정보는 학과 홈페이지, 교수 개인 페이지, 교내 공지 등 여러 채널에 흩어져 있습니다.
똑똑(TTOK-TTOK)은 공개된 정보를 연구실 단위로 구조화하여 학생이 다음 질문에 대한 답을 한곳에서 찾을 수 있도록 하는 것을 목표로 합니다.

- 어떤 연구실이 있는가?
- 각 연구실에서는 무엇을 연구하는가?
- 현재 학부연구생을 모집하고 있는가?
- 학부연구생은 연구실에서 어떤 경험을 하는가?

교수나 연구실을 평가하는 서비스가 아니라, 학부생의 **연구실 탐색과 진입을 돕는 정보·연결 서비스**를 지향합니다.

## MVP

1단계 MVP는 정보기술대학의 연구실 정보를 먼저 구축하여, 별도의 사용자 참여가 없어도 필요한 정보를 탐색할 수 있는 상태를 만드는 데 집중합니다.

### 연구실 탐색

- 연구 분야 태그 및 키워드 검색
- 연구실별 프로필 조회
- 지도 교수, 연구 분야, 위치, 홈페이지 등 기본 정보 제공
- 최근 논문 3~5개 및 소속 인원 규모 등 연구 정보 제공

### 학부연구생 모집 정보

- 공개된 학부연구생 모집 정보 조회
- 모집 상태, 모집 분야, 모집 기간 및 지원 방법 제공
- 상세 내용을 확인할 수 있는 원문 페이지 연결

### 학부연구생 경험 정보

- 주간 미팅 빈도
- 코어타임 유무
- 학부연구생의 주요 업무 및 활동 정보

데이터 제공 범위와 세부 표현 방식은 실제 확보 가능한 정보 및 사용자 검증 결과에 따라 조정될 수 있습니다.

## 향후 검토 기능

다음 기능은 서비스가 지향하는 방향이지만 1단계 MVP의 필수 범위에는 포함하지 않습니다.

- 현재 학부연구생과의 커피챗 연결
- 인증된 연구실 구성원이 답변하는 익명 Q&A
- 자연어로 작성한 관심 분야와 사용자 정보를 기반으로 한 연구실 추천
- 연구 진입 장벽을 낮추기 위한 논문 요약
- 교수 또는 연구실 구성원이 직접 관리하는 연구실 페이지

## 프론트엔드 범위

이 저장소는 똑똑(TTOK-TTOK)의 웹 클라이언트를 관리합니다.

- 반응형 웹 UI 구현
- 사용자 입력과 화면 상태 관리
- 별도 백엔드 서버 API 연동
- 접근성과 사용자 경험 개선
- Storybook을 통한 UI 컴포넌트 문서화
- Chromatic을 통한 시각적 변경 검토

백엔드 API, 크롤러, 데이터 수집 및 저장 파이프라인은 이 저장소의 범위에 포함하지 않습니다. Next.js 서버 기능은 렌더링과 프론트엔드에 필요한 연동 범위에서 사용하며, 주 백엔드는 별도 서버로 운영합니다.

## 기술 스택

### 현재 구성

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- ESLint
- pnpm
- Feature-Sliced Design(FSD)
- Storybook
- Chromatic

## 시작하기

### 요구 사항

- Node.js `v24.18.0` (`.node-version` 참고)
- pnpm

### 설치 및 실행

```bash
pnpm install
pnpm dev
```

개발 서버는 기본적으로 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 명령어

| 명령어 | 설명 |
| --- | --- |
| `pnpm dev` | 개발 서버 실행 |
| `pnpm lint` | ESLint 검사 |
| `pnpm build` | 프로덕션 빌드 생성 |
| `pnpm start` | 프로덕션 서버 실행 |
| `pnpm storybook` | Storybook 개발 서버 실행 |
| `pnpm build-storybook` | Storybook 정적 빌드 생성 |
| `pnpm chromatic` | Storybook을 Chromatic에 게시 |

## Storybook과 Chromatic

Storybook은 기본적으로 [http://localhost:6006](http://localhost:6006)에서 실행됩니다.

Chromatic을 사용하려면 Chromatic에서 프로젝트를 생성한 뒤 GitHub 저장소의 Actions secret에 프로젝트 토큰을 등록합니다.

```text
CHROMATIC_PROJECT_TOKEN
```

토큰이 등록되면 `main` 브랜치 push와 pull request에서 Chromatic 워크플로가 실행됩니다. 로컬에서는 같은 이름의 환경 변수를 설정한 뒤 `pnpm chromatic`을 실행합니다. 프로젝트 토큰은 코드나 환경 변수 예시 파일에 직접 기록하지 않습니다.

## 프로젝트 구조

```text
app/           # Next.js App Router 진입점(라우트 파일만 유지)
pages/         # Pages Router 미사용 표시용 빈 디렉터리
src/
├── _app/      # FSD 앱 초기화, 전역 스타일과 설정
├── _pages/    # 라우트에 대응하는 화면 구성
├── widgets/   # 여러 기능을 조합한 독립적인 UI 블록
├── features/  # 사용자의 행동과 비즈니스 기능
├── entities/  # 핵심 비즈니스 개체
└── shared/    # 공통 UI, API 클라이언트, 유틸리티
```

루트 `app`은 Next.js App Router의 파일 규칙만 담당하고 실제 화면은 `src/_pages`의 공개 API에서 가져옵니다. FSD의 `app`, `pages` 레이어는 Next.js 예약 디렉터리와 구분하기 위해 각각 `_app`, `_pages`로 표기합니다. 루트 `pages`는 `.gitkeep`만 두며 Pages Router 코드는 작성하지 않습니다.

## 개발 문서

- [개발 컨벤션](./docs/development-convention.md)
- [커밋 컨벤션](./docs/commit-convention.md)

## 팀 구성

- Frontend Developer 1명
- Backend Developer 1명
- Product Manager 1명
- Product Designer 2명

# 개발 컨벤션

## 1. 기술 스택

- Next.js App Router
- React
- TypeScript
- Feature-Sliced Design(FSD)
- Tailwind CSS
- Storybook
- Chromatic
- pnpm

백엔드는 별도 서버로 운영한다. Next.js의 서버 기능을 주 백엔드로 사용하지 않으며, 프론트엔드에 필요한 범위에서 렌더링과 백엔드 API 연동에 활용한다.

## 2. 패키지 관리

패키지 매니저는 `pnpm`으로 통일한다. 의존성 변경 시 `package.json`과 `pnpm-lock.yaml`을 함께 커밋한다.

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
```

- 동일한 목적의 라이브러리를 중복해서 설치하지 않는다.
- 새 의존성을 추가하기 전에 기존 코드나 표준 API로 해결할 수 있는지 확인한다.
- 개발에만 필요한 패키지는 `pnpm add -D`로 설치한다.

## 3. 디렉터리 구조

```text
app/           # Next.js App Router 진입점(라우트 파일만 유지)
pages/         # Pages Router 미사용 표시용 빈 디렉터리
src/
├── _app/      # 애플리케이션 초기화, 프로바이더, 전역 설정
├── _pages/    # 라우트에 대응하는 화면 구성
├── widgets/   # 여러 기능과 엔티티를 조합한 독립적인 UI 블록
├── features/  # 사용자의 행동과 비즈니스 기능
├── entities/  # 핵심 비즈니스 개체
└── shared/    # 프로젝트 전반에서 재사용하는 기반 코드
```

루트 `app`은 Next.js App Router의 예약 파일만 두고 실제 화면 구성은 `src/_pages`에 위임한다. FSD의 `app`, `pages` 레이어는 Next.js 예약 디렉터리와 구분하기 위해 `_app`, `_pages`로 표기한다. 루트 `pages`에는 `.gitkeep`만 유지하며 Pages Router 코드는 작성하지 않는다.

### 레이어별 역할

| 레이어 | 역할 | 예시 |
| --- | --- | --- |
| 루트 `app` | Next.js 라우트 진입점 | `page.tsx`, `layout.tsx`, 메타데이터 파일 |
| `_app` | 애플리케이션 초기화 | 전역 스타일, 전역 Provider, 앱 설정 |
| `_pages` | 한 페이지의 전체 구성 | 연구실 목록 화면, 연구실 상세 화면 |
| `widgets` | 페이지에서 독립적인 큰 UI 영역 | 헤더, 연구실 검색 결과 목록 |
| `features` | 사용자가 수행하는 기능 | 연구실 검색, 모집 상태 필터, 커피챗 신청 |
| `entities` | 도메인 데이터와 관련 UI | 연구실, 사용자, 후기 |
| `shared` | 도메인에 의존하지 않는 공통 요소 | UI 컴포넌트, API 클라이언트, 유틸리티 |

### 의존성 방향

상위 레이어는 하위 레이어만 참조한다.

```text
root app -> _app / _pages -> widgets -> features -> entities -> shared
```

- 같은 레이어의 다른 슬라이스를 직접 참조하지 않는 것을 원칙으로 한다.
- 하위 레이어가 상위 레이어를 import하지 않는다.
- 외부에서 사용할 모듈은 각 슬라이스의 `index.ts`를 통해 공개한다.
- 구현 파일의 내부 경로를 직접 import하지 않는다.

```ts
// 권장
import { LabCard } from '@/entities/lab';

// 지양
import { LabCard } from '@/entities/lab/ui/lab-card';
```

### 슬라이스 내부 구조

필요한 세그먼트만 생성한다. 빈 디렉터리를 미리 만들지 않는다.

```text
features/search-lab/
├── api/       # 기능 전용 API 요청
├── model/     # 상태, 타입, 비즈니스 로직
├── ui/        # 기능 UI
├── lib/       # 기능 내부 유틸리티
└── index.ts   # 공개 API
```

## 4. Next.js 작성 기준

- 루트 `app`의 라우트 파일은 얇게 유지하고 화면 구성은 `src/_pages`에 위임한다.
- 컴포넌트는 기본적으로 Server Component로 작성한다.
- 상태, 이벤트, 브라우저 API가 필요한 경계에만 `'use client'`를 선언한다.
- `'use client'`를 페이지 전체에 적용하기보다 상호작용이 필요한 작은 컴포넌트로 한정한다.
- `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx` 등 App Router의 파일 규칙을 따른다.
- 이미지에는 가능한 한 `next/image`, 내부 이동에는 `next/link`를 사용한다.
- 서버 전용 값이나 비밀 키가 클라이언트 번들에 포함되지 않도록 한다.

```tsx
// app/labs/page.tsx
export { LabsPage as default } from '@/_pages/labs';
```

## 5. TypeScript

- `any` 사용을 금지하고, 불가피한 외부 입력은 `unknown`으로 받은 뒤 타입을 좁힌다.
- 컴포넌트 Props, API 요청과 응답, 함수 반환값의 의미가 드러나도록 타입을 정의한다.
- 단순한 타입 추론이 가능한 지역 변수에는 불필요한 타입을 작성하지 않는다.
- 타입 단언(`as`)보다 타입 가드와 데이터 검증을 우선한다.
- 문자열이나 숫자로 상태를 표현하기보다 유니언 타입을 사용한다.

```ts
type RecruitmentStatus = 'open' | 'always' | 'closed';
```

- 여러 슬라이스가 공유하는 도메인 타입이라는 이유만으로 `shared`에 두지 않는다. 도메인 타입은 해당 `entity`가 소유한다.

## 6. 명명 규칙

| 대상 | 규칙 | 예시 |
| --- | --- | --- |
| 컴포넌트 | PascalCase | `LabCard` |
| 함수와 변수 | camelCase | `fetchLabs`, `isLoading` |
| 상수 | UPPER_SNAKE_CASE | `MAX_REVIEW_LENGTH` |
| 타입과 인터페이스 | PascalCase | `Lab`, `LabCardProps` |
| 일반 파일과 디렉터리 | kebab-case | `lab-card.tsx`, `search-lab/` |
| Next.js 특수 파일 | 프레임워크 규칙 | `page.tsx`, `layout.tsx` |

- 이벤트 핸들러는 `handle`로 시작한다: `handleSubmit`, `handleLabSelect`.
- Props로 전달하는 이벤트 함수는 `on`으로 시작한다: `onSubmit`, `onLabSelect`.
- boolean 값은 상태가 드러나는 접두사를 사용한다: `isOpen`, `hasReview`, `canApply`.
- 의미가 불분명한 축약어와 한 글자 변수는 사용하지 않는다. 단, 짧은 반복문의 인덱스 등 문맥이 명확한 경우는 허용한다.

## 7. 컴포넌트

- 컴포넌트는 하나의 명확한 책임을 갖도록 작성한다.
- 재사용 가능성만을 예상해 성급하게 공통 컴포넌트로 분리하지 않는다.
- 도메인 지식이 없는 범용 UI만 `shared/ui`에 둔다.
- 도메인 개념을 표현하는 UI는 해당 `entity`, 사용자 행동을 수행하는 UI는 해당 `feature`에 둔다.
- Props는 컴포넌트가 실제로 필요한 최소 데이터와 동작만 받는다.
- 파생 가능한 값은 별도 state로 저장하지 않는다.
- 목록을 렌더링할 때 배열 인덱스 대신 안정적인 식별자를 `key`로 사용한다.

## 8. 스타일링과 UI

- 기본 스타일링 도구는 Tailwind CSS를 사용한다.
- 디자인 토큰이 정해지면 색상, 간격, 타이포그래피 값을 토큰으로 관리한다.
- 임의의 색상값과 간격을 반복해서 작성하지 않는다.
- 반응형 레이아웃은 모바일 화면부터 확인한다.
- 클릭 가능한 요소는 용도에 맞는 `button` 또는 `a` 요소를 사용한다.
- 아이콘만 있는 버튼에는 접근 가능한 이름(`aria-label`)을 제공한다.
- 이미지에는 의미에 맞는 대체 텍스트를 작성한다. 장식 이미지는 빈 대체 텍스트를 사용한다.
- 키보드만으로 주요 기능을 이용할 수 있어야 하며, 포커스 표시를 제거하지 않는다.

## 9. 상태 관리

상태는 필요한 곳에서 가장 가까운 위치에 둔다.

1. 컴포넌트 내부 상태
2. 인접 컴포넌트가 공유하는 상위 상태
3. 서버 상태 관리 도구의 캐시
4. 여러 화면에서 필요한 클라이언트 전역 상태

- URL로 표현 가능한 검색어, 필터, 정렬, 페이지 번호는 쿼리 파라미터 사용을 우선한다.
- 서버에서 받은 데이터를 불필요하게 전역 클라이언트 상태로 복제하지 않는다.
- 전역 상태 관리 라이브러리는 실제 요구사항과 상태의 수명 범위를 확인한 뒤 도입한다.

## 10. API 연동

- 백엔드 API의 기본 URL은 환경 변수로 관리한다.
- 브라우저에 공개되어도 되는 환경 변수에만 `NEXT_PUBLIC_` 접두사를 사용한다.
- 공통 HTTP 클라이언트와 범용 에러 처리는 `shared/api`에 둔다.
- 도메인별 요청 함수와 요청·응답 타입은 해당 `entity` 또는 `feature`가 소유한다.
- 로딩, 빈 데이터, 오류, 성공 상태를 모두 처리한다.
- API 응답을 신뢰하지 않고 필요한 경우 런타임 검증을 수행한다.
- 인증 정보나 민감한 데이터를 로그에 출력하지 않는다.

환경 변수 파일은 Git에 커밋하지 않고, 필요한 키만 `.env.example`에 문서화한다.

```text
NEXT_PUBLIC_API_BASE_URL=
```

## 11. Storybook과 Chromatic

- 재사용 UI 컴포넌트는 Storybook 스토리를 함께 작성한다.
- 스토리는 기본 상태뿐 아니라 로딩, 오류, 빈 값, 긴 텍스트, 비활성 상태 등 경계 조건을 포함한다.
- API 호출에 직접 의존하지 않고 고정된 fixture 또는 mock을 사용한다.
- 디자인 검토가 필요한 변경은 Chromatic 결과를 확인한다.
- 의도하지 않은 시각적 변경이 없는지 검토한 뒤 스냅샷 변경을 승인한다.

```text
lab-card.tsx
lab-card.stories.tsx
```

```bash
pnpm storybook
pnpm build-storybook
pnpm chromatic
```

- Storybook 개발 서버는 기본적으로 `http://localhost:6006`에서 실행한다.
- Chromatic 프로젝트 토큰은 `CHROMATIC_PROJECT_TOKEN` 환경 변수와 GitHub Actions secret으로 관리한다.
- 프로젝트 토큰을 저장소나 환경 변수 예시 파일에 직접 작성하지 않는다.

## 12. 코드 품질과 PR

작업을 올리기 전에 최소한 다음 명령을 실행한다.

```bash
pnpm lint
pnpm build
```

- 기능 변경에는 정상 흐름과 주요 예외 흐름을 확인한다.
- 공통 컴포넌트 변경 시 해당 컴포넌트를 사용하는 화면도 확인한다.
- PR은 가능한 한 하나의 목적만 포함하고, 변경 이유와 검증 방법을 작성한다.
- UI 변경은 확인 가능한 스크린샷 또는 Chromatic 링크를 첨부한다.
- 리뷰 반영 과정에서 작업 범위가 크게 달라지면 PR 설명도 갱신한다.

## 13. 브랜치

```text
<type>/#<issue-number>-<short-description>
```

예시:

```text
feature/#1-lab-list
fix/#2-recruitment-filter
```

- 브랜치 타입은 작업 성격에 맞게 `feature`, `fix`, `refactor`, `chore`, `docs` 등을 사용한다.
- 설명은 영문 kebab-case로 간결하게 작성한다.
- 하나의 브랜치는 하나의 이슈 또는 작업 단위를 기준으로 한다.

커밋 메시지 규칙은 [커밋 컨벤션](./commit-convention.md)을 따른다.

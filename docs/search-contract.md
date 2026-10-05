# 연구실 검색 계약 (TTOK-63)

2026-10-05 Swagger `/v3/api-docs` 기준.
명세: https://ttokttok-server.inuappcenter.kr/swagger-ui/index.html#/

| URL | 조회 API | 조건 |
| --- | --- | --- |
| `/search` | `GET /api/laboratory?page=0` | 전체 |
| `/search?q=검색어` | `GET /api/laboratory/search?keyword=검색어&page=0` | 연구실명·교수명 단일 키워드 |
| `/search?category=AI` | `GET /api/laboratory/search/category?categoryName=AI&page=0` | 상위 분야 단일 선택 |
| `/search?department=학과명` | `GET /api/laboratory/search?department=학과명&page=0` | 서버 학과 한글 명칭 |
| `/search?department=학과명&q=검색어` | 동일 API의 `department`와 `keyword` | 학과 내 연구실명·교수명 검색 |
| 위 URL에 `&page=1` | 동일 API의 `page=1` | 0부터 시작하는 페이지 |

- 검색 가능한 분야는 `GET /api/research-area-category`의 `categoryName`을 사용한다. 목록이 없을 때 드롭다운은 Figma 예시 목록으로 활성화한다. 예시 선택은 UI 상태만 변경하며, 검색 제출 시 서버 목록에 없는 분야는 안내하고 요청하지 않는다. 이미 URL로 조회한 분야는 유지한다.
- 목록 API는 `page`만 명세에 있다. 페이지 크기·정렬은 서버 응답을 따르며 UI의 전체 개수·현재 페이지·다음 페이지 여부를 응답에서 매핑한다.
- 상위 분야와 키워드 또는 학과의 동시 검색, 중복 조건은 오류와 초기화를 제공하고 연구실 조회를 호출하지 않는다. 학과 단독과 학과+키워드는 최신 API에 연결한다.
- 조건은 앞뒤 공백을 제거한다. 빈 키워드·분야는 전체 조회이며 빈 keyword API 요청을 보내지 않는다.
- 음수·소수·지수 표기·서버 int32 범위를 넘는 페이지는 0으로 정규화한다. 반복 page 값은 첫 값을 사용한다.
- 페이지 링크는 현재 조건을 유지한다. 드롭다운 선택은 입력 폼의 상태만 변경하며 검색 버튼·Enter 제출 시 첫 페이지로 이동한다. 분야와 키워드를 동시에 입력하면 조건 선택 오류를 표시한다.
- 초기화는 `/search`로 이동한다. 모든 전환은 Next Link 또는 router.push를 사용하여 새로고침·직접 접근·뒤로 가기에서 URL 조건을 복원한다.
- 키워드 입력은 URL 값과 분야를 key로 삼아 라우트 전환 완료 후 복원한다. 입력 중에는 API를 요청하지 않고 Enter·검색 버튼으로 제출한다.
- 조회 실패는 오류 상태로, 성공한 빈 목록은 정상 빈 결과로 표시한다. 분야 목록 실패는 결과 목록을 가리지 않고 Figma 예시 드롭다운을 제공한다. 미지원 조건에 대한 안내는 검색 제출 시에만 표시한다.
- 홈과 검색 결과 화면은 같은 분야·학과·키워드 검색바를 사용한다. 학과 조건은 URL에서 복원하고 검색 제출·페이지 이동에도 유지한다. 드롭다운의 기존 예시 분류는 유지하며, 홈 디렉터리는 개수 API의 실제 departmentName으로 이동한다.

검증: `node --test tests/search-conditions.test.mjs`, `pnpm lint`, `pnpm build`.

## 운영 서버 확인

2026-10-02 비로그인 요청에서 분야 목록 API는 HTTP 403을 반환했다. 반면 `categoryName=AI` 검색은 200이며 전체 26건, 20건/페이지, 총 2페이지였다. 목록 실패 시 키워드·분야 직접 URL 검색은 계속 제공하고 드롭다운은 Figma 예시로 사용할 수 있다. 분야 목록의 공개 접근 정책은 서버 확인이 필요하며, 전체 분야 선택의 운영 검증은 403 해소 후 완료한다.


## 학과별 탐색 연결 · TTOK-65

GET /api/laboratory/college-department/count의 단과대 코드·명칭과 학과 코드·명칭·count를 사용한다. 단과대 순서는 서버 순서, 학과는 개수 내림차순이며 동률은 서버 순서를 보존한다. 0개 학과 및 빈 단과대는 표시하지 않는다. 학과 검색은 enum 코드가 아니라 departmentName을 전달한다. 개수 API는 기존 공통 조회의 5분 재검증을 사용하고 검색 결과는 캐시하지 않는다.

2026-10-05 실제 API의 9개 단과대, 30개 학과를 검사했으며 각 count와 학과 검색 totalElements 및 반환 학과가 일치했다. 이후 데이터 갱신 시 홈 캐시와 검색 결과 사이에 최대 5분 차이가 생길 수 있다.

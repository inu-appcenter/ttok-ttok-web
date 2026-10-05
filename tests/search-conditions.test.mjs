import assert from "node:assert/strict";
import test from "node:test";
import {
  createSearchHref,
  getSearchRequest,
  parseSearchConditions,
} from "../src/features/search-lab/model/search-conditions.ts";

const parseHref = (href) =>
  parseSearchConditions(
    Object.fromEntries(new URL(href, "https://example.test").searchParams),
  );

test("키워드와 분야의 한글·특수문자를 URL 왕복에서 보존한다", () => {
  for (const value of [
    { query: "김 교수 & AI/ML" },
    { category: "AI / 데이터" },
  ]) {
    const conditions = parseSearchConditions({
      q: value.query,
      category: value.category,
      page: "2",
    });
    assert.deepEqual(parseHref(createSearchHref(conditions)), conditions);
  }
});

test("페이지 링크는 조건을 유지하고 조건 변경·초기화는 첫 페이지로 이동한다", () => {
  const current = parseSearchConditions({ category: "AI", page: "3" });
  assert.deepEqual(parseHref(createSearchHref({ ...current, page: 4 })), {
    query: "",
    category: "AI",
    page: 4,
  });
  assert.deepEqual(parseHref(createSearchHref({ query: "교수명" })), {
    query: "교수명",
    category: "",
    page: 0,
  });
  assert.deepEqual(parseHref(createSearchHref({ category: "보안" })), {
    query: "",
    category: "보안",
    page: 0,
  });
  assert.equal(createSearchHref(), "/search");
});

test("지원하지 않는 분야 조합·중복 조건은 실제 조회로 처리하지 않는다", () => {
  for (const params of [
    { q: "김", category: "AI" },
    { category: ["AI", "보안"] },
    { q: ["김", "이"] },
    { category: "AI", department: "컴퓨터공학부" },
    { department: ["", "컴퓨터공학부"] },
  ]) {
    const conditions = parseSearchConditions(params);
    assert.ok(conditions.error);
    assert.equal(getSearchRequest(conditions), null);
  }
});

test("공백 검색과 잘못된 페이지를 전체 조회·첫 페이지로 정규화한다", () => {
  for (const page of [
    "-1",
    "1.5",
    "1e2",
    "Infinity",
    "999999999999999999",
    "2147483648",
  ]) {
    assert.deepEqual(parseSearchConditions({ q: "  ", category: " ", page }), {
      query: "",
      category: "",
      page: 0,
    });
  }
  assert.equal(parseSearchConditions({ page: "0002" }).page, 2);
});

test("서버 계약에 따라 전체·키워드·상위 분야 API와 파라미터를 구분한다", () => {
  assert.deepEqual(getSearchRequest(parseSearchConditions({ page: "2" })), {
    path: "/api/laboratory",
    params: { page: "2" },
  });
  assert.deepEqual(
    getSearchRequest(parseSearchConditions({ q: "  김 교수  ", page: "1" })),
    {
      path: "/api/laboratory/search",
      params: { keyword: "김 교수", page: "1" },
    },
  );
  assert.deepEqual(
    getSearchRequest(parseSearchConditions({ category: " AI " })),
    {
      path: "/api/laboratory/search/category",
      params: { categoryName: "AI", page: "0" },
    },
  );
});

test("학과명 URL과 키워드 조합을 실제 검색 요청과 페이지 이동에 보존한다", () => {
  const conditions = parseSearchConditions({
    department: " 도시환경공학부(건설환경공학전공) ",
    q: "김 & 이",
    page: "2",
  });
  assert.deepEqual(parseHref(createSearchHref(conditions)), conditions);
  assert.deepEqual(getSearchRequest(conditions), {
    path: "/api/laboratory/search",
    params: {
      keyword: "김 & 이",
      department: "도시환경공학부(건설환경공학전공)",
      page: "2",
    },
  });
  assert.deepEqual(
    getSearchRequest(parseSearchConditions({ department: "전기공학과" })),
    {
      path: "/api/laboratory/search",
      params: { keyword: "", department: "전기공학과", page: "0" },
    },
  );
  assert.equal(parseHref(createSearchHref({ department: "수학과" })).page, 0);
});

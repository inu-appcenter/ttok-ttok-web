import assert from "node:assert/strict";
import test from "node:test";
import { appendSearchPage } from "../src/features/search-lab/model/append-search-page.ts";
const page = (number, ids, hasNext = true) => ({
  page: number, content: ids.map((labId) => ({ labId })),
  hasNext, isLast: !hasNext, size: 20, totalElements: 40, totalPages: 2,
});
test("페이지 경계와 추가 페이지 내부 중복을 제거하면서 서버 순서를 유지한다", () => {
  const result = appendSearchPage(page(0, ["a", "b"]), page(1, ["b", "c", "c", "d"], false));
  assert.deepEqual(result.content.map((lab) => lab.labId), ["a", "b", "c", "d"]);
  assert.equal(result.page, 1);
  assert.equal(result.hasNext, false);
});
test("중복·역순·건너뛴 페이지와 마지막 페이지 이후 응답을 거부한다", () => {
  for (const nextPage of [0, 2, -1]) {
    assert.throws(() => appendSearchPage(page(0, ["a"]), page(nextPage, ["b"])));
  }
  assert.throws(() => appendSearchPage(page(1, ["a"], false), page(2, ["b"])));
});

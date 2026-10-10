import assert from "node:assert/strict";
import test from "node:test";
import { toBookmarks } from "../src/entities/bookmark/model/bookmark.ts";
const bookmark = {
  id: 3,
  laboratory: {
    id: 157,
    labName: "연구실",
    departmentName: "컴퓨터공학부",
    professor: { name: "김OO" },
    researchAreas: ["AI"],
    introduction: null,
  },
};
test("북마크 ID와 연구실 ID를 구분하고 전체 카드 데이터를 매핑한다", () => {
  const result = toBookmarks([bookmark])[0];
  assert.equal(result.id, 3);
  assert.equal(result.laboratory.laboratoryId, 157);
  assert.equal(result.laboratory.labId, "157");
  assert.equal(result.laboratory.description, "");
});
test("빈 목록과 잘못된 응답을 구분하고 중복 연구실을 거부한다", () => {
  assert.deepEqual(toBookmarks([]), []);
  for (const value of [
    null,
    {},
    [bookmark, { ...bookmark, id: 4 }],
    [{ ...bookmark, laboratory: { ...bookmark.laboratory, id: -1 } }],
    [{ ...bookmark, laboratory: { ...bookmark.laboratory, professor: null } }],
  ])
    assert.throws(() => toBookmarks(value));
});

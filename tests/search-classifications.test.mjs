import assert from "node:assert/strict";
import test from "node:test";
import { toCollegeOptions } from "../src/entities/lab/model/search-classifications.ts";

const colleges = [
  { college: "INFORMATION", collegeName: "정보기술대학" },
  { college: "COLLEGE_OF_NULL", collegeName: "단과대 없음" },
];
const departments = [{ college: "INFORMATION", collegeName: "정보기술대학", department: "COMPUTER", departmentName: "컴퓨터공학부" }];

test("서버 순서·코드·이름·빈 단과대와 COLLEGE_OF_NULL을 보존한다", () => {
  assert.deepEqual(toCollegeOptions(colleges, departments), [
    { ...colleges[0], departments: [{ department: "COMPUTER", departmentName: "컴퓨터공학부" }] },
    { ...colleges[1], departments: [] },
  ]);
  assert.deepEqual(toCollegeOptions([], []), []);
});

test("잘못된 응답·누락된 소속·중복 코드를 빈 성공으로 숨기지 않는다", () => {
  assert.throws(() => toCollegeOptions(null, departments));
  assert.throws(() => toCollegeOptions(colleges, null));
  assert.throws(() => toCollegeOptions(colleges, [{ ...departments[0], college: "UNKNOWN" }]));
  assert.throws(() => toCollegeOptions(colleges, [{ ...departments[0], departmentName: "" }]));
  assert.throws(() => toCollegeOptions(colleges, [...departments, ...departments]));
  assert.throws(() => toCollegeOptions([...colleges, colleges[0]], []));
});

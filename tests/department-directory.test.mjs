import assert from "node:assert/strict";
import test from "node:test";
import { parseDepartmentDirectory } from "../src/entities/lab/model/department-directory.ts";

test("0개 학과·빈 단과대를 제외하고 개수순으로 정렬하며 같은 개수의 서버 순서를 보존한다", () => {
  const department = (department, count) => ({
    department,
    departmentName: department,
    count,
  });
  const result = parseDepartmentDirectory([
    {
      college: "A",
      collegeName: "공과대학",
      departments: [
        department("zero", 0),
        department("small", 1),
        department("large", 8),
        department("tie", 8),
        department("fourth", 2),
      ],
    },
    {
      college: "B",
      collegeName: "빈 대학",
      departments: [department("empty", 0)],
    },
  ]);
  assert.equal(result.length, 1);
  assert.deepEqual(
    result[0].departments.map((d) => d.department),
    ["large", "tie", "fourth", "small"],
  );
});
test("정상 빈 목록과 잘못된 응답·개수를 구분한다", () => {
  assert.deepEqual(parseDepartmentDirectory([]), []);
  for (const value of [
    null,
    {},
    [{ college: "A", collegeName: "대학", departments: null }],
    ...[undefined, -1, 1.5, "3"].map((count) => [
      {
        college: "A",
        collegeName: "대학",
        departments: [{ department: "D", departmentName: "학과", count }],
      },
    ]),
  ])
    assert.throws(() => parseDepartmentDirectory(value));
});

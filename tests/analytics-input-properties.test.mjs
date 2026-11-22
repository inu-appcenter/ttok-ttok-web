import assert from "node:assert/strict";
import test from "node:test";

import { filterAnalyticsInputProperties } from "../src/shared/lib/analytics/input-properties.ts";

test("입력값 검증을 켰을 때만 원문 속성을 유지한다", () => {
  const properties = {
    query: "로봇 공학",
    field_query: "컴퓨터",
    keywords: ["로봇", "컴퓨터 비전"],
    keyword_count: 2,
  };
  const enabled = structuredClone(properties);
  filterAnalyticsInputProperties(enabled, true);
  assert.deepEqual(enabled, properties);

  filterAnalyticsInputProperties(properties, false);
  assert.deepEqual(properties, { keyword_count: 2 });
});

test("연락처와 학번 형태의 입력을 제거하고 기존 집계 속성은 유지한다", () => {
  const properties = {
    query: "202012345",
    field_query: "student＠example.test",
    keywords: ["로봇", "https://open.kakao.com/o/example"],
    keyword_count: 2,
  };
  filterAnalyticsInputProperties(properties, true);
  assert.deepEqual(properties, { query: null, field_query: null, keyword_count: 2 });
});

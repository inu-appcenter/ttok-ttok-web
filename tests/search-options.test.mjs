import assert from "node:assert/strict";
import test from "node:test";

import { getFieldIndex, getInitials, matchesField } from "../src/features/search-lab/model/search-options.ts";

test("분야는 한글 초성과 영문 그룹으로 구분한다", () => {
  assert.equal(getInitials("데이터베이스"), "ㄷㅇㅌㅂㅇㅅ");
  assert.equal(getFieldIndex("데이터베이스"), "ㄷ");
  assert.equal(getFieldIndex("딥러닝"), "ㄷ");
  assert.equal(getFieldIndex("AI"), "A-Z");
});

test("분야 검색은 부분 문자열·초성·영문 대소문자를 지원한다", () => {
  assert.equal(matchesField("빅데이터", " 데이터 "), true);
  assert.equal(matchesField("데이터마이닝", "ㄷㅇㅌ"), true);
  assert.equal(matchesField("LLM", "llm"), true);
  assert.equal(matchesField("강화학습", "데이터"), false);
  assert.equal(matchesField("NLP", ""), true);
});

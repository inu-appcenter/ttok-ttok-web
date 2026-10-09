import assert from 'node:assert/strict';
import test from 'node:test';
import { getMockRecommendations } from '../src/features/request-ai-recommendation/model/mock-recommendations.ts';
const input = { interest: '추천시스템', keywords: ['추천시스템'], atmosphere: ['자율적인 분위기'] };
test('미리보기 결과는 유효한 상세 페이지 ID를 가진 3개 연구실이다', async () => {
 const result = await getMockRecommendations(input, new AbortController().signal);
 assert.equal(result.length, 3);
 assert.equal(new Set(result.map(item => item.id)).size, 3);
 assert.ok(result.every(item => Number.isInteger(item.id) && item.id > 0));
 assert.deepEqual(input.keywords, ['추천시스템']);
});
test('취소한 요청은 결과를 반환하지 않는다', async () => {
 const controller = new AbortController();
 const pending = getMockRecommendations(input, controller.signal);
 controller.abort();
 await assert.rejects(pending, { name: 'AbortError' });
});
test('빈 조건은 거절한다', async () => {
 await assert.rejects(getMockRecommendations({...input, keywords: []}, new AbortController().signal));
});

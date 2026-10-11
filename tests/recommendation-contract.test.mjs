import assert from 'node:assert/strict';
import test from 'node:test';
import {validInterest, validSelectedKeywords, parseSuggestedKeywords, parseRecommendationResult} from '../src/features/request-ai-recommendation/model/recommendation-contract.ts';
const lab = {laboratoryId: 157, labName: '연구실', department: '화학과', professorName: '교수', keywords: ['촉매'], reason: '관심 연구와 연결돼요'};
test('관심 연구 300자 및 키워드 3개/30자 제한과 빈 키워드 선택을 지원한다', () => {
 assert.ok(validInterest('가'.repeat(300))); assert.equal(validInterest('가'.repeat(301)),false); assert.equal(validInterest(' '),false);
 assert.ok(validSelectedKeywords([])); assert.equal(validSelectedKeywords(['가'.repeat(31)]),false); assert.equal(validSelectedKeywords(['A','A']),false); assert.equal(validSelectedKeywords(['A','B','C','D']),false);
});
test('실제 추출 키워드와 빈 키워드 응답을 검증한다', () => {
 assert.deepEqual(parseSuggestedKeywords({keywords: []}),[]);
 assert.deepEqual(parseSuggestedKeywords({keywords: ['촉매']}),['촉매']);
 assert.throws(()=>parseSuggestedKeywords({keywords:['A','B','C','D','E','F']}));
});
test('추천 순위를 유지하고 null 이유와 매칭 없음을 구분한다', () => {
 const data=parseRecommendationResult({noMatch:false,recommendations:[lab,{...lab,laboratoryId:20,reason:null}]});
 assert.deepEqual(data.recommendations.map(x=>x.id),[157,20]); assert.deepEqual(data.recommendations[1].reasons,[]);
 assert.deepEqual(parseRecommendationResult({noMatch:true,recommendations:[]}),{noMatch:true,recommendations:[]});
});
test('유효하지 않은 상세 ID, 중복, 잘못된 noMatch 및 4개 추천을 거절한다', () => {
 for(const id of [0,-1,'157',1.5]) assert.throws(()=>parseRecommendationResult({noMatch:false,recommendations:[{...lab,laboratoryId:id}]}));
 assert.throws(()=>parseRecommendationResult({noMatch:false,recommendations:[lab,lab]}));
 assert.throws(()=>parseRecommendationResult({noMatch:true,recommendations:[lab]}));
 assert.throws(()=>parseRecommendationResult({noMatch:false,recommendations:[]}));
 assert.throws(()=>parseRecommendationResult({noMatch:false,recommendations:[1,2,3,4].map(laboratoryId=>({...lab,laboratoryId}))}));
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { EMPTY_EMAIL_INPUT, createMockEmailDraft, validateEmailInput, formatPhone } from '../src/features/write-contact-email/model/email-draft.ts';
const input = { ...EMPTY_EMAIL_INPUT, name: '홍길동', department: '컴퓨터공학부', year: '3학년', email: 'student@example.com', interest: '추천시스템', experience: '파이썬 프로젝트' };
const recipient = { professorName: '김교수', labName: '데이터 연구실', email: 'professor@example.com' };
test('입력한 사실과 교수 수신 주소로 제목과 본문을 분리한다', () => {
 const result = createMockEmailDraft(input, recipient);
 assert.equal(result.recipient, recipient.email);
 assert.match(result.subject, /컴퓨터공학부 3학년 홍길동/);
 assert.match(result.body, /추천시스템/);
 assert.match(result.body, /파이썬 프로젝트/);
 assert.ok(!result.body.includes('연락처:'));
});
test('교수 주소가 없으면 주소를 추측하지 않는다', () => {
 assert.equal(createMockEmailDraft(input, { ...recipient, email: null }).recipient, '');
});
test('목적별 초안과 필수 값/이메일 검증', () => {
 assert.deepEqual(validateEmailInput(input), {});
 assert.ok(validateEmailInput(EMPTY_EMAIL_INPUT).year);
 assert.ok(validateEmailInput({ ...input, email: 'invalid' }).email);
 assert.match(createMockEmailDraft({ ...input, purpose: '교수님께 질문' }, recipient).body, /궁금한 점/);
 assert.match(createMockEmailDraft({ ...input, purpose: '대학원 진학 상담' }, recipient).body, /상담/);
});
test('연락처를 입력 중에도 구분하고 길이를 제한한다', () => {
 assert.equal(formatPhone('01012345678'), '010-1234-5678');
 assert.equal(formatPhone('010-123-4567'), '010-123-4567');
 assert.equal(formatPhone('0101234567899'), '010-1234-5678');
});

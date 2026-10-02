// API 목록이 없어도 Figma의 드롭다운 상호작용을 사용할 수 있는 UI 예시.
// 검색 지원 여부는 별도로 서버에서 받은 categories를 기준으로 판단합니다.
export const FIELD_PREVIEW = [
  "강화학습",
  "거시경제",
  "건축설계",
  "건축환경",
  "게임공학",
  "경영전략",
  "계량경제",
  "계산재료과학",
  "고분자",
  "고체역학",
  "공연예술",
  "광전자",
  "광통신",
  "광학",
  "교육공학",
  "교육학",
  "교통공학",
  "구조공학",
  "국어학",
  "국제관계",
  "국제통상",
  "그래프신경망",
  "금속재료",
  "금융공학",
  "기술경영",
  "기후변화",
  "나노소재",
  "네트워크보안",
  "네트워크최적화",
  "네트워크프로토콜",
  "뇌공학",
  "데이터마이닝",
  "데이터베이스",
  "로보틱스",
  "반도체",
  "빅데이터",
  "컴퓨터비전",
  "LLM",
  "NLP",
];

export const COLLEGE_PREVIEW = [
  {
    name: "공과대학",
    departments: [
      "전자공학과",
      "전기공학과",
      "기계공학과",
      "신소재공학과",
      "산업경영공학과",
    ],
  },
  {
    name: "인공지능대학",
    departments: [
      "컴퓨터공학부",
      "인공지능시스템공학과",
      "인공지능정보통신공학부",
    ],
  },
  {
    name: "자연과학대학",
    departments: ["수학과", "물리학과", "화학과", "해양학과"],
  },
  {
    name: "인문대학",
    departments: ["국어국문학과", "영어영문학과", "일본지역문화학과"],
  },
  {
    name: "사회과학대학",
    departments: ["문헌정보학과", "미디어커뮤니케이션학과", "창의인재개발학과"],
  },
  {
    name: "경영대학",
    departments: ["경영학부", "세무회계학과", "데이터과학과"],
  },
];

export const FIELD_INDEX = [
  "ㄱ",
  "ㄴ",
  "ㄷ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅅ",
  "ㅇ",
  "ㅈ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
  "A-Z",
];
const HANGUL_INITIALS = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
];

export function getInitials(value: string) {
  return [...value]
    .map((character) => {
      const offset = character.charCodeAt(0) - 0xac00;
      return offset >= 0 && offset <= 11171
        ? HANGUL_INITIALS[Math.floor(offset / 588)]
        : character;
    })
    .join("");
}

export function getFieldIndex(value: string) {
  const initial = getInitials(value)[0];
  const basic =
    (
      { ㄲ: "ㄱ", ㄸ: "ㄷ", ㅃ: "ㅂ", ㅆ: "ㅅ", ㅉ: "ㅈ" } as Record<
        string,
        string
      >
    )[initial] ?? initial;
  return FIELD_INDEX.includes(basic) ? basic : "A-Z";
}

export function matchesField(value: string, query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return (
    value.toLocaleLowerCase().includes(normalizedQuery) ||
    getInitials(value).toLocaleLowerCase().includes(normalizedQuery)
  );
}

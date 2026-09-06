import type { LabDetail, LabSummary } from "./lab";

export const MOCK_LABS: LabSummary[] = [
  {
    labId: "intelligent-data-systems",
    name: "지능형 데이터 시스템 연구실",
    professorName: "김다윤",
    department: "컴퓨터공학부",
    tags: ["데이터베이스", "빅데이터", "ML시스템"],
  },
  {
    labId: "applied-ai",
    name: "인공지능 응용 연구실",
    professorName: "이OO",
    department: "산업공학부",
    tags: ["인공지능", "최적화"],
  },
  {
    labId: "data-mining",
    name: "데이터마이닝 연구실",
    professorName: "박OO",
    department: "컴퓨터공학부",
    tags: ["데이터마이닝", "추천시스템"],
  },
  {
    labId: "machine-learning-theory",
    name: "머신러닝 이론 연구실",
    professorName: "최OO",
    department: "산업공학부",
    tags: ["머신러닝", "딥러닝"],
  },
  {
    labId: "robotics",
    name: "로보틱스 연구실",
    professorName: "정OO",
    department: "기계공학부",
    tags: ["로보틱스", "제어"],
  },
];

const DEFAULT_DETAIL: Omit<
  LabDetail,
  "department" | "labId" | "name" | "professorName" | "tags"
> = {
  aiSummary: ["연구실 상세 정보와 주요 연구 내용을 준비하고 있습니다."],
  contact: {
    email: "",
    members: [],
    openChatUrl: "",
  },
  experience: {
    coreTime: "정보 준비 중",
    participantCount: 0,
    primaryTasks: "정보 준비 중",
    weeklyMeeting: "정보 준비 중",
  },
  homepageUrl: "https://www.inu.ac.kr/",
  location: "정보 준비 중",
  memberCounts: { doctoral: 0, masters: 0, undergraduate: 0 },
  papers: [],
};

export const MOCK_LAB_DETAILS: LabDetail[] = MOCK_LABS.map((lab) => ({
  ...lab,
  ...DEFAULT_DETAIL,
  ...(lab.labId === "intelligent-data-systems"
    ? {
        aiSummary: [
          "지능형 데이터 시스템 연구실은 빅데이터, 데이터베이스(DB), 머신러닝(ML) 시스템을 전문적으로 연구하는 기관입니다. 데이터 처리의 효율성을 극대화하고 최신 AI 기술이 실제 시스템 환경에서 안정적으로 동작하도록 인프라와 저장 엔진을 최적화하는 데 집중하고 있습니다.",
          "이 연구실은 KDD, VLDB와 같은 데이터 및 AI 분야의 최고 수준(Top-tier) 국제 학술대회에 꾸준히 논문을 실을 만큼 우수한 연구 역량을 갖추고 있습니다. 실시간 그래프 이상 탐지, 데이터 저장 엔진 성능 개선, 연합 학습 환경의 편향 보정 등 깊이 있는 첨단 기술을 다루는 곳입니다.",
        ],
        contact: {
          email: "dayoon0311@naver.com",
          members: [
            {
              contact: "오픈채팅 열기 ↗",
              name: "학부연구생 A",
              url: "https://open.kakao.com/o/example",
            },
            { contact: "username@inu.ac.kr", name: "학부연구생 B" },
          ],
          openChatUrl: "https://open.kakao.com/o/example",
        },
        experience: {
          coreTime: "있음 (2) / 없음 (1)",
          participantCount: 3,
          primaryTasks: "논문 리딩 (3) · 실험/코딩 (2) · 데이터 라벨링 (1)",
          weeklyMeeting: "주 1회 (2) / 격주 (1)",
        },
        homepageUrl: "https://lab.inu.ac.kr/",
        location: "7호관 409호",
        memberCounts: { doctoral: 2, masters: 4, undergraduate: 3 },
        papers: [
          {
            title: "대규모 그래프 스트림에서의 실시간 이상 탐지 기법",
            url: "https://dl.acm.org/",
            venue: "KDD",
            year: 2025,
          },
          {
            title: "LSM-트리 기반 저장 엔진의 쓰기 증폭 최소화",
            url: "https://www.vldb.org/",
            venue: "VLDB",
            year: 2024,
          },
          {
            title: "연합 학습 환경에서의 데이터 편향 보정 프레임워크",
            url: "https://www.kiise.or.kr/",
            venue: "정보과학회논문지",
            year: 2024,
          },
        ],
      }
    : {}),
}));

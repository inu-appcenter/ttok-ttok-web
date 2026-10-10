import type { Bookmark } from "./bookmark";

export const MOCK_BOOKMARKS: Bookmark[] = [
  [
    157,
    "지능형 데이터 시스템 연구실",
    "김OO",
    ["데이터베이스", "추천시스템", "머신러닝"],
  ],
  [158, "인공지능 연구실", "이OO", ["인공지능", "딥러닝"]],
  [159, "소프트웨어공학 연구실", "박OO", ["소프트웨어공학", "프로그램 분석"]],
  [160, "컴퓨터 비전 연구실", "정OO", ["컴퓨터 비전", "영상처리"]],
  [161, "네트워크 시스템 연구실", "최OO", ["네트워크", "분산 시스템"]],
  [162, "정보보안 연구실", "한OO", ["정보보안", "암호학"]],
].map(([id, name, professor, tags], index) => ({
  id: index + 1,
  laboratory: {
    laboratoryId: id as number,
    labId: String(id),
    name: name as string,
    professorName: professor as string,
    tags: tags as string[],
    department: "컴퓨터공학부",
    description: `${name}에서 다양한 연구를 진행합니다.`,
  },
}));

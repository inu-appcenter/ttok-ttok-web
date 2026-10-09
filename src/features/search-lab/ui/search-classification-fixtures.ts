import type { CollegeOption } from "@/entities/lab";

// Storybook 전용 선택지. 실제 화면은 서버 조회 결과만 사용합니다.
export const CATEGORY_FIXTURE = ["AI", "데이터마이닝", "데이터베이스", "보안"];
export const COLLEGE_FIXTURE: CollegeOption[] = [
  { college: "COLLEGE_OF_INFORMATION_TECHNOLOGY", collegeName: "정보기술대학", departments: [
    { department: "COMPUTER_ENGINEERING", departmentName: "컴퓨터공학부" },
    { department: "INFORMATION_COMMUNICATION_ENGINEERING", departmentName: "정보통신공학과" },
  ] },
  { college: "COLLEGE_OF_NULL", collegeName: "단과대 없음", departments: [] },
];

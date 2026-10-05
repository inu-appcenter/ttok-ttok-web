import type { CollegeLabCount } from "@/entities/lab";

// 디자인·상태 검증용 fixture. 실제 홈은 공개 API 응답을 사용합니다.
export const MOCK_DEPARTMENT_DIRECTORY: CollegeLabCount[] = [
  {
    college: "ENGINEERING",
    collegeName: "공과대학",
    departments: [
      {
        department: "BIO_ROBOTICS",
        departmentName: "바이오 로봇시스템공학과",
        count: 8,
      },
      { department: "ELECTRICAL", departmentName: "전기공학과", count: 6 },
      { department: "INDUSTRIAL", departmentName: "산업경영공학과", count: 6 },
      { department: "MECHANICAL", departmentName: "기계공학과", count: 5 },
      { department: "MATERIALS", departmentName: "신소재공학과", count: 4 },
      { department: "ENERGY", departmentName: "에너지화학공학과", count: 3 },
      { department: "SAFETY", departmentName: "안전공학과", count: 2 },
    ],
  },
  {
    college: "URBAN",
    collegeName: "도시과학대학",
    departments: [
      {
        department: "CIVIL",
        departmentName: "도시환경공학부(건설환경공학전공)",
        count: 6,
      },
      {
        department: "ENVIRONMENT",
        departmentName: "도시환경공학부(환경공학전공)",
        count: 6,
      },
      { department: "URBAN", departmentName: "도시공학과", count: 6 },
      {
        department: "ARCHITECTURE",
        departmentName: "도시건축학부(건축공학전공)",
        count: 5,
      },
      {
        department: "DESIGN",
        departmentName: "도시건축학부(도시건축학전공)",
        count: 4,
      },
      { department: "ADMIN", departmentName: "도시행정학과", count: 3 },
    ],
  },
  {
    college: "NATURAL",
    collegeName: "자연과학대학",
    departments: [
      { department: "MARINE", departmentName: "해양학과", count: 8 },
      { department: "PHYSICS", departmentName: "물리학과", count: 6 },
      { department: "CHEMISTRY", departmentName: "화학과", count: 6 },
      { department: "MATHEMATICS", departmentName: "수학과", count: 5 },
      { department: "FASHION", departmentName: "패션산업학과", count: 4 },
    ],
  },
  {
    college: "ARTS",
    collegeName: "예술체육대학",
    departments: [
      { department: "HEALTH", departmentName: "운동건강학부", count: 8 },
      { department: "DESIGN", departmentName: "디자인학부", count: 6 },
      { department: "PERFORMING", departmentName: "공연예술학과", count: 6 },
      { department: "SPORTS", departmentName: "스포츠과학부", count: 5 },
      { department: "ART", departmentName: "조형예술학부", count: 4 },
    ],
  },
];

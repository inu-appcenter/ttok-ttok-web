export type LaboratoryCapacity = {
  graduateStudentCount: number | null;
  undergraduateStudentCount: number | null;
};

export type LaboratoryProfessor = {
  email: string | null;
  id: number;
  name: string;
  phoneNumber: string | null;
  position: string | null;
};

/** 서버에서 조회한 연구실 목록 항목입니다. */
export type Laboratory = {
  capacity: LaboratoryCapacity;
  college: string;
  collegeName: string;
  department: string;
  departmentName: string;
  id: number;
  introduction: string | null;
  labName: string;
  labUrl: string | null;
  location: string | null;
  professor: LaboratoryProfessor;
  researchAreas: string[];
};

export type LaboratoryPage = {
  content: Laboratory[];
  hasNext: boolean;
  isLast: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type LaboratoryPageParams = {
  page?: number;
  size?: number;
  sort?: string[];
};

export type LaboratorySearchParams = LaboratoryPageParams & {
  keyword?: string;
  department?: string;
};

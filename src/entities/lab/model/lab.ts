export type LabSummary = {
  department: string;
  description: string;
  labId: string;
  laboratoryId: number;
  name: string;
  professorName: string;
  tags: string[];
};

export type LabSummaryPage = {
  content: LabSummary[];
  hasNext: boolean;
  isLast: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type LabPaper = {
  title: string;
  url: string | null;
  venue: string;
  year: number | null;
};

export type LabDetail = LabSummary & {
  aiSummary: string[];
  contact: {
    email: string;
    members: Array<{
      contact: string;
      id: string;
      name: string;
      url?: string;
    }>;
    openChatUrl: string;
  };
  experience: {
    coreTime: string;
    participantCount: number;
    primaryTasks: string;
    weeklyMeeting: string;
  };
  homepageUrl: string | null;
  location: string | null;
  memberCounts: {
    graduate: number | null;
    undergraduate: number | null;
  };
  papers: LabPaper[];
  publicationState?: LabDetailListState;
  projects?: LabResearchProject[];
  projectState?: LabDetailListState;
  professor?: {
    name: string;
    position: string | null;
    email: string | null;
    phone: string | null;
  };
  news?: Array<{
    id: string;
    title: string;
    date: string;
    source: string;
    url: string | null;
  }>;
  metrics?: LabResearchMetrics;
};

export type LabResearchProject = {
  id: string;
  title: string;
  isOngoing: boolean;
  period: string;
  agency: string;
  summary: string;
  url: string | null;
};

export type LabDetailListState = {
  page: number;
  totalPages: number;
  status: "success" | "error";
};

export type LabResearchMetrics = {
  hIndex: number;
  citations: number;
  fiveYearPapers: number;
  hIndexPercentile?: number;
  citationPercentile?: number;
};

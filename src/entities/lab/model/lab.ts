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
  url: string;
  venue: string;
  year: number;
};

export type LabDetail = LabSummary & {
  aiSummary: string[];
  contact: {
    email: string;
    members: Array<{
      contact: string;
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
};

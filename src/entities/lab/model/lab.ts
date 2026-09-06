export type LabSummary = {
  department: string;
  labId: string;
  name: string;
  professorName: string;
  tags: string[];
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
  homepageUrl: string;
  location: string;
  memberCounts: {
    doctoral: number;
    masters: number;
    undergraduate: number;
  };
  papers: LabPaper[];
};

export type MemberResearchProfile = {
  coffeeChatPublic: boolean;
  department: string;
  laboratoryName: string;
  professorName: string;
  registeredAtLabel: string;
  tags: string[];
  laboratoryId?: number;
  coffeeChat?: {
    id: number;
    contactType: "EMAIL" | "KAKAO_TALK";
    contactValue: string;
  };
  review?: { coreTime: string; weeklyMeeting: string; doings: string[] };
};

export type MemberProfile = {
  accountLabel: string;
  department?: string;
  displayName?: string;
  email?: string;
  isUndergraduateResearcher?: boolean;
  researchProfile?: MemberResearchProfile;
  roleLabel?: string;
  studentNumber?: string;
  userType?: "FINDER" | "RESEARCHER" | "PROFESSOR";
  hasContributedReview?: boolean;
};

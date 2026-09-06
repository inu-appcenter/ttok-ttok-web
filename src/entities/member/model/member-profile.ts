export type MemberResearchProfile = {
  coffeeChatPublic: boolean;
  department: string;
  laboratoryName: string;
  professorName: string;
  registeredAtLabel: string;
  tags: string[];
};

export type MemberProfile = {
  accountLabel: string;
  email: string;
  isUndergraduateResearcher: boolean;
  researchProfile?: MemberResearchProfile;
  roleLabel: string;
};

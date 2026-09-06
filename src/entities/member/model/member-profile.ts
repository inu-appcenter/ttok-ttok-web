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
  researchProfile?: MemberResearchProfile;
  roleLabel: string;
};

export type LoginCredentials = {
  password: string;
  studentNumber: string;
};

export type LoginResult =
  | { isNew: boolean; memberId: number; ok: true }
  | {
      message: string;
      ok: false;
    };

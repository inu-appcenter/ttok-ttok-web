export type LoginCredentials = {
  password: string;
  studentNumber: string;
};

export type LoginResult =
  | { ok: true }
  | {
      message: string;
      ok: false;
    };

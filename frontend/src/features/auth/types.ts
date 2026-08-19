export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

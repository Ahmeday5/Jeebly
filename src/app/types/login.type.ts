export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  email: string;
  role: string;
  token: string | null;
}

export interface UserData {
  email: string;
  role: string;
  token: string | null;
}

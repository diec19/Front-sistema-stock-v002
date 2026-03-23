export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

export interface LoginDTO {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
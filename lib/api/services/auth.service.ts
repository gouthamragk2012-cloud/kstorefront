import { apiClient } from '../client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export const authService = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<AuthResponse>('/auth/login', credentials),

  register: (data: RegisterData) =>
    apiClient.post<AuthResponse>('/auth/register', data),

  logout: (token: string) =>
    apiClient.post('/auth/logout', {}, token),
};

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
    user_id: number;
    id?: number;
    email: string;
    first_name: string;
    last_name: string;
    role: 'customer' | 'admin';
  };
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response: any = await apiClient.post('/auth/login', credentials);
    // Backend wraps response in 'data' field
    return response.data || response;
  },

  register: async (data: RegisterData) => {
    const response: any = await apiClient.post('/auth/register', data);
    // Backend wraps response in 'data' field
    return response.data || response;
  },

  logout: (token: string) =>
    apiClient.post('/auth/logout', {}, token),
};

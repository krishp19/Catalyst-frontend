import { httpClient } from '../../lib/api/httpClient';

export interface SignupData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  usernameOrEmail: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  reputationScore: number;
  postScore: number;
  commentScore: number;
  communityScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    status?: number;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async signup(data: SignupData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await httpClient.post<AuthResponse>('/api/auth/register', data);
      return { data: response.data };
    } catch (error: any) {
      console.error('Signup error:', error);
      return {
        error: {
          message: error.message || 'Failed to sign up',
          status: error.response?.status,
        },
      };
    }
  },

  async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await httpClient.post<AuthResponse>('/api/auth/login', data);
      return { data: response.data };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        error: {
          message: error.message || 'Failed to log in',
          status: error.response?.status,
        },
      };
    }
  },
};

export default authService;

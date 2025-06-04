import { httpClient } from '../../lib/api/httpClient';

export interface SignupData {
  username: string;
  email: string;
  password: string;
}

interface User {
  id: string;
  username: string;
  email: string;
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

interface SignupResponse {
  user: User;
  token: string;
}

export const authService = {
  async signup(data: SignupData): Promise<ApiResponse<SignupResponse>> {
    try {
      const response = await httpClient.post<SignupResponse>('/api/auth/register', data);
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
};

export default authService;

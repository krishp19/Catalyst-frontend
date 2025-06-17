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

export interface ResendOtpData {
  email: string;
}

export interface VerifyOtpData {
  email: string;
  otp: string;
}

export interface AuthResponse {
  user: User;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
}

export interface UpdateProfileData {
  bio?: string;
  avatarUrl?: string;
  email?: string;
}

export const authService = {
  async signup(data: SignupData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await httpClient.post<AuthResponse>('/auth/register', data);
      return { 
        data: {
          user: response.data.user,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          message: response.data.message
        } 
      };
    } catch (error: any) {
      console.error('Signup error:', error);
      return {
        error: {
          message: error.response?.data?.message || error.message || 'Failed to sign up',
          status: error.response?.status,
        },
      };
    }
  },

  async verifyOtp(data: VerifyOtpData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await httpClient.post<AuthResponse>('/auth/verify-otp', data);
      return { 
        data: {
          user: response.data.user,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          message: response.data.message
        }
      };
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      return {
        error: {
          message: error.response?.data?.message || error.message || 'Failed to verify OTP',
          status: error.response?.status,
        },
      };
    }
  },

  async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await httpClient.post<AuthResponse>('/auth/login', data);
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

  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await httpClient.get<User>('/users/profile');
      return { data: response.data };
    } catch (error: any) {
      console.error('Get profile error:', error);
      return {
        error: {
          message: error.message || 'Failed to fetch profile',
          status: error.response?.status,
        },
      };
    }
  },

  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<User>> {
    try {
      const response = await httpClient.patch<User>('/users/profile', data);
      return { data: response.data };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return {
        error: {
          message: error.message || 'Failed to update profile',
          status: error.response?.status,
        },
      };
    }
  },
};

export default authService;

// Types for authentication related data structures
export interface User {
  id: string;
  username: string;
  email: string;
  // Add other user fields as needed
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
  status?: number;
  code?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
}

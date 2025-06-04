import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { authService, LoginData } from '../../../../src/services/auth/authService';

interface User {
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

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk<LoginResponse, LoginData, { rejectValue: string }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      if (response.error) {
        return rejectWithValue(response.error.message);
      }
      if (!response.data) {
        return rejectWithValue('No data received');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to login');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ 
      user: User; 
      accessToken: string; 
      refreshToken: string 
    }>) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
      });
  },
});

export const { setCredentials, logout, clearError } = authSlice.actions;
export default authSlice.reducer;

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
  message?: string;
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
        return rejectWithValue('No data received from server');
      }
      // Ensure all required fields are present
      if (!response.data.accessToken || !response.data.refreshToken || !response.data.user) {
        return rejectWithValue('Incomplete authentication data received');
      }
      return {
        user: response.data.user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response) {
        // Server responded with an error
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error || 
                            'Invalid credentials';
        return rejectWithValue(errorMessage);
      } else if (error.request) {
        // Request was made but no response was received
        return rejectWithValue('Unable to connect to the server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        return rejectWithValue(error.message || 'An unexpected error occurred');
      }
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
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = action.payload || 'Login failed';
      });
  },
});

export const { setCredentials, logout, clearError } = authSlice.actions;
export default authSlice.reducer;

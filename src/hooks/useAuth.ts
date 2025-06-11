import { useAppSelector } from '../store/hooks';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../store/features/auth/authSlice';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

// Define the shape of our auth context
type AuthContextType = {
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (isOpen: boolean) => void;
  isSignupModalOpen: boolean;
  setIsSignupModalOpen: (isOpen: boolean) => void;
  user: any; // We can make this more specific if needed
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

export interface User {
  karma: number;
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setIsLoginModalOpen: (isOpen: boolean) => void;
}

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isLoading, isAuthenticated } = useAppSelector((state) => state.auth);
  const authContext = useContext<AuthContextType>(AuthContext as React.Context<AuthContextType>);

  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    logout: handleLogout,
    isLoginModalOpen: authContext?.isLoginModalOpen || false,
    setIsLoginModalOpen: authContext?.setIsLoginModalOpen || (() => {
      console.warn('AuthContext not found. Make sure your app is wrapped with AuthProvider');
    }),
    isSignupModalOpen: authContext?.isSignupModalOpen || false,
    setIsSignupModalOpen: authContext?.setIsSignupModalOpen || (() => {
      console.warn('AuthContext not found. Make sure your app is wrapped with AuthProvider');
    })
  } as const;
}
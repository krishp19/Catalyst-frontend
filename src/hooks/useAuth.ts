import { useAppSelector } from '../store/hooks';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../store/features/auth/authSlice';

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

  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    logout: handleLogout,
    setIsLoginModalOpen: (isOpen: boolean) => {
      // Implement modal state management here
      console.log('Modal state:', isOpen);
    }
  };
} 
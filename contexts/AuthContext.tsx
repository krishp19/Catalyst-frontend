"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';

type User = {
  id: string;
  username: string;
  karma: number;
  avatar: string;
} | null;

interface AuthContextType {
  user: User;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (value: boolean) => void;
  isSignupModalOpen: boolean;
  setIsSignupModalOpen: (value: boolean) => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate checking if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('catalyst-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user for frontend demo
      const mockUser = {
        id: '1',
        username,
        karma: 1024,
        avatar: `https://api.dicebear.com/7.x/personas/svg?seed=${username}`,
      };
      
      setUser(mockUser);
      localStorage.setItem('catalyst-user', JSON.stringify(mockUser));
      setIsLoginModalOpen(false);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user for frontend demo
      const mockUser = {
        id: '1',
        username,
        karma: 0,
        avatar: `https://api.dicebear.com/7.x/personas/svg?seed=${username}`,
      };
      
      setUser(mockUser);
      localStorage.setItem('catalyst-user', JSON.stringify(mockUser));
      setIsSignupModalOpen(false);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('catalyst-user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isSignupModalOpen,
        setIsSignupModalOpen,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
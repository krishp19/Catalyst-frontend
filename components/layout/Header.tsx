"use client";

import React from 'react';
import { Search, Bell, MessageSquare, ChevronDown, Menu, X, Moon, Sun, User, Image, Users, Star, LogOut } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAppSelector, useAppDispatch } from '../../src/store/hooks';
import { logout } from '../../src/store/features/auth/authSlice';
import { LoginModal } from '../../components/auth/LoginModal';
import { SignupModal } from '../../components/auth/SignupModal';
import { useTheme } from 'next-themes';
import { cn } from '../../lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { MobileSidebar } from './MobileSidebar';
import defaultAvatar from '../../assets/avatar.webp';

const Header = () => {
  const { user, isAuthenticated } = useAppSelector((state: any) => state.auth);
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = React.useState(false);
  const dispatch = useAppDispatch();
  
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center h-14 px-4 md:px-6">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <div className="relative h-8 w-8 mr-2">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full"></div>
                <div className="absolute inset-[2px] bg-background rounded-full flex items-center justify-center">
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-orange-500 to-pink-500 font-bold">C</span>
                </div>
              </div>
              <span className="hidden sm:inline-block font-bold text-xl">Catalyst</span>
            </a>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 mx-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search Catalyst"
                className="w-full pl-8 bg-muted focus-visible:ring-1"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <MessageSquare className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Bell className="h-5 w-5" />
            </Button>

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 p-1 md:p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || defaultAvatar} alt={user.username} />
                      <AvatarFallback>{user.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium">{user.username}</span>
                      <span className="text-xs text-muted-foreground">{user.karma} karma</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 bg-background border rounded-md shadow-lg">
                  <DropdownMenuItem className="flex items-center gap-2 p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || defaultAvatar} alt={user.username} />
                      <AvatarFallback>{user.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.username}</span>
                      <span className="text-xs text-muted-foreground">{user.karma} karma</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem className="flex items-center gap-2 p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                    <User className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors" onClick={() => window.location.href = '/profile'}>
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                    <Image className="h-4 w-4" />
                    <span>Edit Avatar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                    <Users className="h-4 w-4" />
                    <span>Manage Community</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                    <Star className="h-4 w-4" />
                    <span>Premium</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem className="flex items-center gap-2 p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors" onClick={() => dispatch(logout())}>
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  Login
                </Button>
                <Button 
                  size="sm"
                  onClick={() => {
                    setIsLoginModalOpen(false);
                    setIsSignupModalOpen(true);
                  }}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      <LoginModal 
        open={isLoginModalOpen} 
        onOpenChange={setIsLoginModalOpen}
        onSignupClick={() => {
          setIsLoginModalOpen(false);
          setIsSignupModalOpen(true);
        }}
      />
      <SignupModal 
        open={isSignupModalOpen}
        onOpenChange={setIsSignupModalOpen}
        onLoginClick={() => {
          setIsSignupModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </>
  );
};

export default Header;
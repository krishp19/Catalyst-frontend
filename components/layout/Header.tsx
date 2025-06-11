"use client";

import React, { useRef, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, MessageSquare, ChevronDown, User, Image as ImageIcon, Users, Star, LogOut, Plus, Menu, Search as SearchIcon, XCircle } from 'lucide-react';
import SearchBar from './SearchBar';
import { notificationService } from '@/services/notificationService';
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
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import defaultAvatar from '../../assets/avatar.webp';
import { SearchResults } from '../search/SearchResults';
import { useSearch } from '@/hooks/useSearch';
import { cn } from '../../lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import MobileSidebar from './MobileSidebar';

const Header = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state: any) => state.auth);
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  // Use auth context for modal state management
  const { 
    isLoginModalOpen, 
    setIsLoginModalOpen, 
    isSignupModalOpen, 
    setIsSignupModalOpen 
  } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  // Search functionality
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { query, setQuery } = useSearch();

  // Close mobile search when clicking outside
  useEffect(() => {
    if (showMobileSearch) {
      const handleClickOutside = (event: MouseEvent) => {
        setShowMobileSearch(false);
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMobileSearch]);

  // Clear search when navigating to a new page
  useEffect(() => {
    setQuery('');
    setShowMobileSearch(false);
  }, [pathname, setQuery]);

  // Theme is now managed elsewhere

  // Fetch unread notification count
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUnreadCount = async () => {
      try {
        setIsLoading(true);
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to fetch unread notifications count:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnreadCount();
    
    // Set up polling to refresh the count every 10 seconds
    const interval = setInterval(fetchUnreadCount, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return (
    <div className="sticky top-0 z-50 w-full">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center h-14 px-4 md:px-6">
          {/* Mobile Menu Button */}
          <div className="md:hidden mr-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px] sm:w-[300px]">
                <MobileSidebar onNavigate={() => {
                  // This will close the sheet when a navigation occurs
                  const closeButton = document.querySelector('button[data-state="open"]');
                  if (closeButton) {
                    (closeButton as HTMLButtonElement).click();
                  }
                }} />
              </SheetContent>
            </Sheet>
          </div>
          
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

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 mx-4 relative mt-2">
            <SearchBar className="w-full max-w-2xl" />
          </div>

          {/* Mobile Search */}
          <div className="md:hidden ml-auto mr-1 relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileSearch(true)}
              className={`h-9 w-9 ${showMobileSearch ? 'opacity-0 pointer-events-none' : ''}`}
            >
              <SearchIcon className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
            
            {showMobileSearch && (
              <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
                <div className="p-4 border-b">
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMobileSearch(false);
                      }}
                      className="h-9 w-9 mr-2"
                    >
                      <XCircle className="h-5 w-5" />
                      <span className="sr-only">Close search</span>
                    </Button>
                    <div className="flex-1">
                      <SearchBar 
                        autoFocus
                        onResultClick={(e) => {
                          // Close the mobile search after a small delay to allow navigation to complete
                          setTimeout(() => setShowMobileSearch(false), 100);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {/* This empty div ensures the search results appear below the search bar */}
                </div>
              </div>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4 ml-auto">
            {/* Notification Button - Hidden on mobile when search is open */}
            <div className={cn("relative", showMobileSearch && "hidden")}>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-accent/50 relative"
                onClick={() => router.push('/notifications')}
              >
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-orange-500 text-white text-xs font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Create Post Button */}
            {isAuthenticated && (
              <Button
                variant="default"
                className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => router.push('/create-post')}
              >
                <Plus className="h-4 w-4" />
                <span className="font-medium text-sm">Create</span>
              </Button>
            )}
            
            {/* Create Post Button - Mobile */}
            {isAuthenticated && (
              <Button
                variant="default"
                size="icon"
                className="sm:hidden h-9 w-9 rounded-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => router.push('/create-post')}
              >
                <Plus className="h-5 w-5" />
                <span className="sr-only">Create Post</span>
              </Button>
            )}

            <Button variant="ghost" size="icon" className="hidden md:flex">
              <MessageSquare className="h-5 w-5" />
              <span className="sr-only">Messages</span>
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
                  <DropdownMenuItem className="flex items-center gap-3 p-3 hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 rounded-md transition-colors">
                    <User className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium">Edit Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center gap-3 p-3 hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 rounded-md transition-colors" 
                    onClick={() => window.location.href = '/profile'}
                  >
                    <User className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium">Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 p-3 hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 rounded-md transition-colors">
                    <ImageIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm font-medium">Edit Avatar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 p-3 hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 rounded-md transition-colors">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium">Manage Community</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 p-3 hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 rounded-md transition-colors">
                    <Star className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium">Premium</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2 border-t border-gray-200 dark:border-gray-700" />
                  <DropdownMenuItem 
                    className="flex items-center gap-3 p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 rounded-md transition-colors" 
                    onClick={async () => {
                      await dispatch(logout());
                      // Force a full page refresh after logout to ensure all components get the updated auth state
                      window.location.reload();
                    }}
                  >
                    <LogOut className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                {/* Desktop Login/Signup Buttons - Hidden on mobile */}
                <div className="hidden md:flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsLoginModalOpen(true)}
                    className="hidden md:inline-flex h-9 px-4 rounded-full border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200"
                  >
                    Log In
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => {
                      setIsLoginModalOpen(false);
                      setIsSignupModalOpen(true);
                    }}
                    className="hidden md:inline-flex h-9 px-4 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    Sign Up
                  </Button>
                </div>
                
                {/* Mobile User Icon - Shows login modal */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  <User className="h-5 w-5" />
                  <span className="sr-only">Login or Sign up</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modals */}
      <LoginModal 
        open={isLoginModalOpen} 
        onOpenChange={setIsLoginModalOpen}
        onSignupClick={() => {
          setIsLoginModalOpen(false);
          setIsSignupModalOpen(true);
        }}
        onSuccess={() => {
          // Force a full page refresh to ensure all components get the updated auth state
          window.location.reload();
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
      
      {/* Mobile search overlay - Only show when search is active */}
      {showMobileSearch && (
        <div 
          className="fixed-0 bg-black/50 z-40 md:hidden transition-opacity duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setShowMobileSearch(false);
          }}
          onTouchStart={(e) => e.stopPropagation()}
          style={{
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 40,
            pointerEvents: 'auto' // Ensure overlay is clickable
          }}
        />
      )}
    </div>
  );
};

export default Header;
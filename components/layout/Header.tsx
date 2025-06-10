"use client";

import React, { useRef, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Bell, MessageSquare, ChevronDown, Moon, Sun, User, Image as ImageIcon, Users, Star, LogOut, Plus, XCircle, Menu } from 'lucide-react';
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
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  // Search functionality
  const searchRef = useRef<HTMLDivElement>(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const {
    query,
    setQuery, 
    type,
    setType,
    sort,
    setSort,
    isSearching,
    results,
    isOpen,
    setIsOpen,
    handleResultClick,
  } = useSearch();

  // Close mobile search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (showMobileSearch) {
          setShowMobileSearch(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsOpen, showMobileSearch]);

  // Clear search when navigating to a new page
  useEffect(() => {
    setQuery('');
    setIsOpen(false);
    setShowMobileSearch(false);
  }, [pathname, setQuery, setIsOpen]);

  // Clear search when navigating to a new page
  useEffect(() => {
    setQuery('');
    setIsOpen(false);
  }, [pathname, setQuery, setIsOpen]);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

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
                <MobileSidebar onNavigate={() => {}} />
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
          <div className="hidden md:flex flex-1 mx-4 relative mt-2" ref={searchRef}>
            <div className="relative w-full max-w-2xl">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-pink-500/5 rounded-lg -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-hover:text-foreground transition-colors" />
                <Input
                  type="search"
                  placeholder="Search posts, communities, and more..."
                  className="w-full pl-10 pr-10 bg-background border border-border/70 hover:border-orange-500/50 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 transition-all duration-200 shadow-sm rounded-lg h-10"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => query.trim() && setIsOpen(true)}
                />
                {query && (
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground hover:scale-110 transition-all duration-200"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Search filters */}
              <div className={`flex flex-wrap items-center gap-2 mt-2 transition-all duration-200 overflow-hidden ${query.trim() ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-muted-foreground text-xs font-medium">Search in:</span>
                  <Button
                    variant={type === 'all' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setType('all')}
                    className={`h-7 px-2.5 text-xs rounded-md transition-all ${type === 'all' ? 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20' : 'hover:bg-accent'}`}
                  >
                    All
                  </Button>
                  <Button
                    variant={type === 'posts' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setType('posts')}
                    className={`h-7 px-2.5 text-xs rounded-md transition-all ${type === 'posts' ? 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20' : 'hover:bg-accent'}`}
                  >
                    Posts
                  </Button>
                  <Button
                    variant={type === 'communities' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setType('communities')}
                    className={`h-7 px-2.5 text-xs rounded-md transition-all ${type === 'communities' ? 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20' : 'hover:bg-accent'}`}
                  >
                    Communities
                  </Button>
                </div>
                <div className="flex items-center gap-1 text-xs ml-auto">
                  <span className="text-muted-foreground text-xs font-medium">Sort by:</span>
                  <Button
                    variant={sort === 'relevance' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setSort('relevance')}
                    className={`h-7 px-2.5 text-xs rounded-md transition-all ${sort === 'relevance' ? 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20' : 'hover:bg-accent'}`}
                  >
                    Relevance
                  </Button>
                  <Button
                    variant={sort === 'newest' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setSort('newest')}
                    className={`h-7 px-2.5 text-xs rounded-md transition-all ${sort === 'newest' ? 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20' : 'hover:bg-accent'}`}
                  >
                    Newest
                  </Button>
                  <Button
                    variant={sort === 'top' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setSort('top')}
                    className={`h-7 px-2.5 text-xs rounded-md transition-all ${sort === 'top' ? 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20' : 'hover:bg-accent'}`}
                  >
                    Top
                  </Button>
                </div>
              </div>

              {/* Search results */}
              {isOpen && (
                <div className="absolute z-50 w-full mt-1 overflow-hidden rounded-lg shadow-xl border border-border bg-background">
                  <SearchResults
                    results={results}
                    isLoading={isSearching}
                    onResultClick={handleResultClick}
                    query={query}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden ml-auto mr-1 relative">
            <div className="relative" ref={searchRef}>
              {showMobileSearch ? (
                <div className="fixed top-4 right-4 left-4 z-50">
                  <div className="bg-background shadow-lg rounded-md p-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search posts, communities, and more..."
                        className="w-full pl-10 pr-10 bg-background border border-border/70 hover:border-orange-500/50 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 transition-all duration-200 shadow-sm rounded-lg h-10 text-sm"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query.trim() && setIsOpen(true)}
                        autoFocus
                      />
                      {query ? (
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground hover:scale-110 transition-all duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuery('');
                          }}
                          aria-label="Clear search"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                    {isOpen && (
                      <div className="mt-1 pt-2 max-h-[60vh] overflow-y-auto">
                        <SearchResults
                          results={results}
                          isLoading={isSearching}
                          onResultClick={() => {
                            setShowMobileSearch(false);
                          }}
                          query={query}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMobileSearch(true);
                  }}
                  className="h-9 w-9"
                >
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
                </Button>
              )}
            </div>
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
                onClick={() => router.push('/submit')}
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
                  <DropdownMenuItem className="flex items-center gap-2 p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                    <User className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors" onClick={() => window.location.href = '/profile'}>
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                    <ImageIcon className="h-4 w-4" aria-hidden="true" />
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
                  <DropdownMenuItem className="flex items-center gap-2 p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors" onClick={toggleTheme}>
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
              <>
                {/* Desktop Login/Signup Buttons - Hidden on mobile */}
                <div className="hidden md:flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsLoginModalOpen(true)}
                    className="hidden md:inline-flex"
                  >
                    Login
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => {
                      setIsLoginModalOpen(false);
                      setIsSignupModalOpen(true);
                    }}
                    className="hidden md:inline-flex"
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
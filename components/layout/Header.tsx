"use client";

import React, { useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Bell, MessageSquare, ChevronDown, Menu, X, Moon, Sun, User, Image as ImageIcon, Users, Star, LogOut, Plus, XCircle } from 'lucide-react';
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
import { SearchResults } from '../search/SearchResults';
import { useSearch } from '@/hooks/useSearch';

const Header = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state: any) => state.auth);
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = React.useState(false);
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  // Search functionality
  const searchRef = useRef<HTMLDivElement>(null);
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

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsOpen]);

  // Clear search when navigating to a new page
  useEffect(() => {
    setQuery('');
    setIsOpen(false);
  }, [pathname, setQuery, setIsOpen]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

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
          <div className="hidden md:flex flex-1 mx-4 relative" ref={searchRef}>
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
                <div className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-50 mt-1 overflow-hidden rounded-lg shadow-xl border border-border bg-background max-h-[calc(100vh-100px)]">
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

          {/* Right side actions */}
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <MessageSquare className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 px-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={user?.avatar || defaultAvatar.src} alt={user?.username} />
                        <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline-flex items-center gap-1">
                        {user?.username}
                        <ChevronDown className="h-4 w-4" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => router.push(`/u/${user?.username}`)}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/create/post')}>
                      <Plus className="mr-2 h-4 w-4" />
                      <span>Create Post</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/create/community')}>
                      <Users className="mr-2 h-4 w-4" />
                      <span>Create Community</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                      {theme === 'dark' ? (
                        <Sun className="mr-2 h-4 w-4" />
                      ) : (
                        <Moon className="mr-2 h-4 w-4" />
                      )}
                      <span>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="hidden md:flex"
                >
                  Log In
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsSignupModalOpen(true)}
                  className="hidden md:flex"
                >
                  Sign Up
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="md:hidden"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
                <MobileSidebar />
              </SheetContent>
            </Sheet>
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
"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '../../lib/utils';
import { Home, TrendingUp as Trending, Rocket, Plus, Moon, Sun, ChevronDown, HelpCircle, Settings, Gamepad2, Music, Film, BookOpen, Image as ImageIcon, Users as UsersIcon, Star, Clock, Award, Heart, Zap, MessageSquare } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { CreateCommunityModal } from '../communities/CreateCommunityModal';
import { LoginModal } from '../auth/LoginModal';
import { SignupModal } from '../auth/SignupModal';
import { useAppSelector } from '../../src/store/hooks';
import { useTheme } from 'next-themes';
import { communityService, Community } from '../../src/services/communityService';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon, label, href, active, onClick }: SidebarItemProps) => {
  return (
    <Link 
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active 
          ? "bg-accent text-accent-foreground" 
          : "hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

const SidebarSection = ({ title, children }: SidebarSectionProps) => {
  return (
    <div className="mb-4">
      <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </h3>
      {children}
    </div>
  );
};

interface MobileSidebarProps {
  onNavigate?: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ onNavigate }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user } = useAppSelector((state: any) => state.auth);
  const [isCreateCommunityModalOpen, setIsCreateCommunityModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [joinedCommunities, setJoinedCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const fetchJoinedCommunities = async () => {
      if (isAuthenticated) {
        try {
          const response = await communityService.getJoinedCommunities();
          setJoinedCommunities(response.items || []);
        } catch (error) {
          console.error('Error fetching joined communities:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchJoinedCommunities();
  }, [isAuthenticated]);

  const handleNavigation = (href: string) => {
    router.push(href);
    if (onNavigate) onNavigate();
  };

  const renderJoinedCommunities = () => {
    if (!isAuthenticated) {
      return (
        <div className="px-4 py-2 text-sm text-muted-foreground">
          Sign in to see your communities
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="space-y-2 px-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (joinedCommunities.length === 0) {
      return (
        <div className="px-4 py-2 text-sm text-muted-foreground">
          You haven't joined any communities yet
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {joinedCommunities.map((community) => (
          <Link
            key={community.id}
            href={`/r/${community.name}`}
            className={cn(
              "flex items-center gap-3 px-4 py-2 text-sm transition-colors",
              isActive(`/r/${community.name}`)
                ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium"
                : "hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400"
            )}
            onClick={() => handleNavigation(`/r/${community.name}`)}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={community.iconUrl} alt={community.name} />
              <AvatarFallback>{community.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate">r/{community.name}</p>
              <p className="text-xs text-muted-foreground">
                {community.memberCount?.toLocaleString()} members
              </p>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative h-8 w-8 mr-2">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full"></div>
              <div className="absolute inset-[2px] bg-background rounded-full flex items-center justify-center">
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-orange-500 to-pink-500 font-bold">C</span>
              </div>
            </div>
            <span className="font-bold text-xl">Catalyst</span>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
          
        {/* User Info */}
        {isAuthenticated ? (
          <div className="flex items-center mt-4 p-2 bg-accent/50 rounded-lg">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={user?.avatar} alt={user?.username} />
              <AvatarFallback>{user?.username?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.username}</p>
              <p className="text-xs text-muted-foreground">{user?.karma?.toLocaleString()} karma</p>
            </div>
            <Button variant="ghost" size="icon" className="ml-2">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground px-2">
              Create an account to follow your favorite communities and start taking part in conversations.
            </p>
            <div className="mt-4 space-y-2">
              <Button 
                variant="default" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => {
                  if (onNavigate) onNavigate();
                  setIsLoginModalOpen(true);
                }}
              >
                Log In
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  if (onNavigate) onNavigate();
                  setIsSignupModalOpen(true);
                }}
              >
                Sign Up
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <ScrollArea className="flex-1 py-4">
        <SidebarSection title="FEEDS">
          <SidebarItem 
            icon={<Home className="h-4 w-4" />} 
            label="Home" 
            href="/" 
            active={isActive('/')}
            onClick={() => handleNavigation('/')}
          />
          <SidebarItem 
            icon={<Trending className="h-4 w-4" />} 
            label="Popular" 
            href="/popular" 
            active={isActive('/popular')}
            onClick={() => handleNavigation('/popular')}
          />
          <SidebarItem 
            icon={<Rocket className="h-4 w-4" />} 
            label="All" 
            href="/all" 
            active={isActive('/all')}
            onClick={() => handleNavigation('/all')}
          />
          <SidebarItem 
            icon={<Clock className="h-4 w-4" />} 
            label="Recent" 
            href="/recent" 
            active={isActive('/recent')}
            onClick={() => handleNavigation('/recent')}
          />
        </SidebarSection>

        <SidebarSection title="TOPICS">
          <SidebarItem 
            icon={<Gamepad2 className="h-4 w-4" />} 
            label="Gaming" 
            href="/topic/gaming" 
            active={isActive('/topic/gaming')}
            onClick={() => handleNavigation('/topic/gaming')}
          />
          <SidebarItem 
            icon={<Music className="h-4 w-4" />} 
            label="Music" 
            href="/topic/music" 
            active={isActive('/topic/music')}
            onClick={() => handleNavigation('/topic/music')}
          />
          <SidebarItem 
            icon={<Film className="h-4 w-4" />} 
            label="Movies & TV" 
            href="/topic/movies" 
            active={isActive('/topic/movies')}
            onClick={() => handleNavigation('/topic/movies')}
          />
          <SidebarItem 
            icon={<BookOpen className="h-4 w-4" />} 
            label="Books & Writing" 
            href="/topic/books" 
            active={isActive('/topic/books')}
            onClick={() => handleNavigation('/topic/books')}
          />
          <SidebarItem 
            icon={<ImageIcon className="h-4 w-4" />} 
            label="Art" 
            href="/topic/art" 
            active={isActive('/topic/art')}
            onClick={() => handleNavigation('/topic/art')}
          />
        </SidebarSection>

        <SidebarSection title="YOUR COMMUNITIES">
          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-sm font-normal"
                onClick={() => {
                  if (onNavigate) onNavigate();
                  setIsCreateCommunityModalOpen(true);
                }}
              >
                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <Plus className="h-3.5 w-3.5 text-orange-500" />
                </div>
                Create Community
              </Button>
              {renderJoinedCommunities()}
            </>
          ) : (
            <div className="px-4 py-2 text-sm text-muted-foreground">
              Sign in to see your communities
            </div>
          )}
        </SidebarSection>

        <SidebarSection title="RESOURCES">
          <SidebarItem 
            icon={<HelpCircle className="h-4 w-4" />} 
            label="Help Center" 
            href="/help" 
            active={isActive('/help')}
            onClick={() => handleNavigation('/help')}
          />
          <SidebarItem 
            icon={<Settings className="h-4 w-4" />} 
            label="Settings" 
            href="/settings" 
            active={isActive('/settings')}
            onClick={() => handleNavigation('/settings')}
          />
        </SidebarSection>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
        </Button>
      </div>

      <CreateCommunityModal
        open={isCreateCommunityModalOpen}
        onOpenChange={setIsCreateCommunityModalOpen}
      />
      
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
    </div>
  );
};

export default MobileSidebar;
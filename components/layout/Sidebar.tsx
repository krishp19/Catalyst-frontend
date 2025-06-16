"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '../../lib/utils';
import { Home, TrendingUp as Trending, Rocket, Gamepad2, Music, Film, BookOpen, Image as ImageIcon, Users, Plus, Sparkles, Clock, Award, Heart, Zap, Star, Settings, HelpCircle, Moon, Sun } from 'lucide-react';
import { Separator } from '../../components/ui/separator';
import { Button } from '../../components/ui/button';
import { ScrollArea } from '../../components/ui/scroll-area';
import { CreateCommunityModal } from '../communities/CreateCommunityModal';
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
}

const SidebarItem = ({ icon, label, href, active }: SidebarItemProps) => {
  return (
    <Link 
      href={href}
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
      <h3 className="mb-2 px-4 text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
};

const Sidebar = () => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const [isCreateCommunityModalOpen, setIsCreateCommunityModalOpen] = useState(false);
  const { isAuthenticated } = useAppSelector((state: any) => state.auth);
  const { theme, setTheme } = useTheme();
  const [joinedCommunities, setJoinedCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJoinedCommunities = async () => {
      if (isAuthenticated) {
        try {
          const response = await communityService.getJoinedCommunities();
          setJoinedCommunities(response.items);
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
            <div key={i} className="flex items-center gap-3" data-testid="community-skeleton">
              <Skeleton className="h-8 w-8 rounded-full" data-testid="skeleton-avatar" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" data-testid="skeleton-name" />
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
          You haven&apos;t joined any communities yet
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
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={community.iconUrl} alt={community.name} />
              <AvatarFallback>{community.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate">r/{community.name}</p>
              <p className="text-xs text-muted-foreground">
                {community.memberCount.toLocaleString()} members
              </p>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-orange-100 dark:border-orange-900/30 bg-white dark:bg-gray-900 h-[calc(100vh-3.5rem)] sticky top-14">
        <ScrollArea className="flex-1 py-4">
          <SidebarSection title="FEEDS">
            <SidebarItem 
              icon={<Home className="h-4 w-4" />} 
              label="Home" 
              href="/" 
              active={isActive('/')} 
            />
            <SidebarItem 
              icon={<Trending className="h-4 w-4" />} 
              label="Popular" 
              href="/popular" 
              active={isActive('/popular')} 
            />
            <SidebarItem 
              icon={<Rocket className="h-4 w-4" />} 
              label="All" 
              href="/all" 
              active={isActive('/all')} 
            />
          </SidebarSection>
          
          <SidebarSection title="TOPICS">
            <SidebarItem 
              icon={<Gamepad2 className="h-4 w-4" />} 
              label="Gaming" 
              href="/topic/gaming" 
              active={isActive('/topic/gaming')} 
            />
            <SidebarItem 
              icon={<Music className="h-4 w-4" />} 
              label="Music" 
              href="/topic/music" 
              active={isActive('/topic/music')} 
            />
            <SidebarItem 
              icon={<Film className="h-4 w-4" />} 
              label="Movies & TV" 
              href="/topic/movies" 
              active={isActive('/topic/movies')} 
            />
            <SidebarItem 
              icon={<BookOpen className="h-4 w-4" />} 
              label="Books & Writing" 
              href="/topic/books" 
              active={isActive('/topic/books')} 
            />
            <SidebarItem 
              icon={<ImageIcon className="h-4 w-4" aria-hidden="true" />} 
              label="Art" 
              href="/topic/art" 
              active={isActive('/topic/art')} 
            />
          </SidebarSection>
          
          {isAuthenticated && (
            <Button 
              variant="outline" 
              className="w-[calc(100%-2rem)] mx-4 my-2 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
              onClick={() => setIsCreateCommunityModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> Create Community
            </Button>
          )}
          
          <Separator className="my-4 bg-orange-100 dark:bg-orange-900/30" />
          
          <SidebarSection title="JOINED COMMUNITIES">
            {renderJoinedCommunities()}
          </SidebarSection>
          
          <Separator className="my-4 bg-orange-100 dark:bg-orange-900/30" />
          
          <SidebarSection title="RESOURCES">
            <SidebarItem 
              icon={<Settings className="h-4 w-4" />} 
              label="Settings" 
              href="/settings" 
              active={isActive('/settings')} 
            />
            <SidebarItem 
              icon={<HelpCircle className="h-4 w-4" />} 
              label="Help Center" 
              href="/help" 
              active={isActive('/help')} 
            />
            <Button
              variant="ghost"
              className="w-full justify-start px-3 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 mr-2" />
              ) : (
                <Moon className="h-4 w-4 mr-2" />
              )}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
          </SidebarSection>
        </ScrollArea>
      </aside>

      <CreateCommunityModal
        open={isCreateCommunityModalOpen}
        onOpenChange={setIsCreateCommunityModalOpen}
      />
    </>
  );
};

export default Sidebar;
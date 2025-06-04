"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, TrendingUp as Trending, Rocket, Gamepad2, Music, Film, BookOpen, Image, Users, Plus, Settings, HelpCircle, Moon, Sun } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

const SidebarItem = ({ icon, label, href, active }: SidebarItemProps) => {
  return (
    <a 
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
    </a>
  );
};

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

const SidebarSection = ({ title, children }: SidebarSectionProps) => {
  return (
    <div className="mb-4">
      <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
};

export const MobileSidebar = () => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const { user, setIsLoginModalOpen } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col h-full">
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
        
        {user ? (
          <div className="flex items-center mt-4 p-2 bg-accent/50 rounded-lg">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback>{user.username[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.username}</p>
              <p className="text-xs text-muted-foreground">{user.karma} karma</p>
            </div>
          </div>
        ) : (
          <Button 
            className="w-full mt-4" 
            onClick={() => setIsLoginModalOpen(true)}
          >
            Sign In / Sign Up
          </Button>
        )}
      </div>
      
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
            icon={<Image className="h-4 w-4" />} 
            label="Art" 
            href="/topic/art" 
            active={isActive('/topic/art')} 
          />
        </SidebarSection>
        
        <Button variant="outline" className="w-[calc(100%-2rem)] mx-4 my-2">
          <Plus className="h-4 w-4 mr-2" /> Create Community
        </Button>
        
        <Separator className="my-4" />
        
        <SidebarSection title="COMMUNITIES">
          <SidebarItem 
            icon={<Users className="h-4 w-4" />} 
            label="r/technology" 
            href="/r/technology" 
            active={isActive('/r/technology')} 
          />
          <SidebarItem 
            icon={<Users className="h-4 w-4" />} 
            label="r/webdev" 
            href="/r/webdev" 
            active={isActive('/r/webdev')} 
          />
          <SidebarItem 
            icon={<Users className="h-4 w-4" />} 
            label="r/programming" 
            href="/r/programming" 
            active={isActive('/r/programming')} 
          />
          <SidebarItem 
            icon={<Users className="h-4 w-4" />} 
            label="r/reactjs" 
            href="/r/reactjs" 
            active={isActive('/r/reactjs')} 
          />
          <SidebarItem 
            icon={<Users className="h-4 w-4" />} 
            label="r/nextjs" 
            href="/r/nextjs" 
            active={isActive('/r/nextjs')} 
          />
        </SidebarSection>
        
        <Separator className="my-4" />
        
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
        </SidebarSection>
      </ScrollArea>
    </div>
  );
};
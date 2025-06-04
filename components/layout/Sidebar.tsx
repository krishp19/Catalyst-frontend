"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, TrendingUp as Trending, Rocket, Gamepad2, Music, Film, BookOpen, Image, Users, Plus, Sparkles, Clock, Award, Heart, Zap, Star, Settings, HelpCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

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

const Sidebar = () => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r h-[calc(100vh-3.5rem)] sticky top-14">
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
    </aside>
  );
};

export default Sidebar;
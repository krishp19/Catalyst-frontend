"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { ArrowUp } from 'lucide-react';

interface Community {
  id: string;
  name: string;
  icon: string;
  members: number;
  trending?: boolean;
}

interface TopCommunitiesProps {
  communities?: Community[];
}

export const TopCommunities = ({ communities = defaultCommunities }: TopCommunitiesProps) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Top Growing Communities</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <ul className="divide-y">
          {communities.map((community, index) => (
            <li key={community.id} className="p-3 hover:bg-muted/50 transition-colors">
              <a href={`/r/${community.name}`} className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground w-6">
                  {index + 1}
                </span>
                
                {community.trending && (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                )}
                
                <Avatar className="h-8 w-8">
                  <AvatarImage src={community.icon} alt={community.name} />
                  <AvatarFallback>{community.name[0]}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">r/{community.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {community.members.toLocaleString()} members
                  </p>
                </div>
                
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Join
                </Button>
              </a>
            </li>
          ))}
        </ul>
        
        <div className="p-3">
          <Button variant="ghost" className="w-full text-sm" size="sm">
            View All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const defaultCommunities: Community[] = [
  {
    id: '1',
    name: 'programming',
    icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=programming',
    members: 5243000,
    trending: true,
  },
  {
    id: '2',
    name: 'webdev',
    icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=webdev',
    members: 934000,
    trending: true,
  },
  {
    id: '3',
    name: 'nextjs',
    icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=nextjs',
    members: 324000,
  },
  {
    id: '4',
    name: 'reactjs',
    icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=reactjs',
    members: 842000,
    trending: true,
  },
  {
    id: '5',
    name: 'tailwindcss',
    icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=tailwindcss',
    members: 254000,
  },
];
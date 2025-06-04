"use client";

import React, { useState } from 'react';
import { PostCard } from '@/components/posts/PostCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rocket, Flame, Clock, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Post } from '@/lib/types';
import { mockPosts } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';

interface PostListProps {
  initialPosts?: Post[];
}

export const PostList = ({ initialPosts = mockPosts }: PostListProps) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [timeFilter, setTimeFilter] = useState<string>("today");
  
  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value);
    // Here you would typically filter posts based on the selected time
    // For demo purposes, we'll just keep the same posts
  };
  
  return (
    <div>
      <Card className="p-2 mb-4">
        <Tabs defaultValue="hot" className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="hot" className="gap-1.5">
                <Flame className="h-4 w-4" />
                <span className="hidden sm:inline">Hot</span>
              </TabsTrigger>
              <TabsTrigger value="new" className="gap-1.5">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">New</span>
              </TabsTrigger>
              <TabsTrigger value="top" className="gap-1.5">
                <Rocket className="h-4 w-4" />
                <span className="hidden sm:inline">Top</span>
              </TabsTrigger>
            </TabsList>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 h-8">
                  <span className="hidden sm:inline">
                    {timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleTimeFilterChange("today")}>
                  Today
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTimeFilterChange("week")}>
                  This Week
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTimeFilterChange("month")}>
                  This Month
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTimeFilterChange("year")}>
                  This Year
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTimeFilterChange("all")}>
                  All Time
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <TabsContent value="hot" className="mt-4 space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </TabsContent>
          
          <TabsContent value="new" className="mt-4 space-y-4">
            {/* Sort posts by creation date, newest first */}
            {[...posts]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            }
          </TabsContent>
          
          <TabsContent value="top" className="mt-4 space-y-4">
            {/* Sort posts by votes, highest first */}
            {[...posts]
              .sort((a, b) => b.votes - a.votes)
              .map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            }
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
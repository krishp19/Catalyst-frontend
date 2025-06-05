"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PostCard } from '../../components/posts/PostCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Rocket, Flame, Clock, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Post } from '../../lib/types';
import { Card } from '../../components/ui/card';
import { postService } from '../../src/services/postService';
import { useToast } from '../../hooks/use-toast';
import { useInView } from 'react-intersection-observer';

interface PostListProps {
  initialPosts?: Post[];
  showJoinedCommunities?: boolean;
  className?: string;
}

export const PostList = ({ initialPosts, showJoinedCommunities = false }: PostListProps) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts || []);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('new');
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [timeFilter, setTimeFilter] = useState<string>("today");
  const { toast } = useToast();
  
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });
  
  // Load more posts when scrolled to bottom
  useEffect(() => {
    if (inView && hasMore && !loading) {
      handleLoadMore();
    }
  }, [inView, hasMore, loading]);
  
  const fetchPosts = useCallback(async (pageNum: number, sort: string, reset = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      
      const response = showJoinedCommunities 
        ? await postService.getJoinedCommunityPosts({
            page: pageNum,
            limit: 10,
            sort
          })
        : await postService.getPosts({
            page: pageNum,
            limit: 10,
            sort
          });
      
      console.log('API Response:', response);
      
      // Ensure we have valid posts and update state
      const items = Array.isArray(response?.items) ? response.items : [];
      
      // Map API response to Post type
      const uiPosts: Post[] = items.map((apiPost: any) => ({
        id: apiPost.id,
        title: apiPost.title,
        content: apiPost.content || '',
        imageUrl: apiPost.imageUrl,
        linkUrl: apiPost.linkUrl,
        type: apiPost.type,
        author: {
          id: apiPost.author.id,
          username: apiPost.author.username,
          avatar: apiPost.author.avatarUrl || '',
          karma: 0 // Default value since it's not in the API response
        },
        community: {
          id: apiPost.community.id,
          name: apiPost.community.name,
          icon: apiPost.community.iconUrl || '',
          description: apiPost.community.description || '',
          members: apiPost.community.memberCount,
          createdAt: apiPost.community.createdAt
        },
        votes: apiPost.score || 0,
        upvotes: apiPost.upvotes || 0,
        downvotes: apiPost.downvotes || 0,
        commentCount: apiPost.commentCount || 0,
        isPinned: apiPost.isPinned || false,
        createdAt: apiPost.createdAt,
        updatedAt: apiPost.updatedAt || apiPost.createdAt,
        tags: apiPost.tags || []
      }));
      
      setPosts(prev => reset ? uiPosts : [...prev, ...uiPosts]);
      setHasMore(response?.meta?.currentPage < response?.meta?.totalPages);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to load posts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [showJoinedCommunities, toast]);

  // Initial load and when sort changes
  useEffect(() => {
    fetchPosts(1, sortBy, true);
  }, [sortBy, showJoinedCommunities, fetchPosts]);
  
  // Sort posts by creation date (newest first) for display
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [posts]);
  
  // Load more posts when scrolled to bottom or when manually triggered
  const loadMorePosts = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, sortBy, false);
    }
  }, [hasMore, loading, page, sortBy, fetchPosts]);

  // Trigger load more when scroll reaches the bottom
  useEffect(() => {
    if (inView) {
      loadMorePosts();
    }
  }, [inView, loadMorePosts]);
  
  const handleLoadMore = () => {
    loadMorePosts();
  };
 
  const handleSortChange = (value: 'hot' | 'new' | 'top') => {
    if (value === sortBy) return;
    setSortBy(value);
    setPage(1);
  };

  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value);
    // TODO: Implement time-based filtering if needed
  };
  
  return (
    <div>
      <Card className="p-2 mb-4">
        <Tabs 
          defaultValue="new" 
          className="w-full"
          onValueChange={(value) => handleSortChange(value as 'hot' | 'new' | 'top')}
        >
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <TabsContent value="hot">
            <div className="space-y-4 mt-4">
              {sortedPosts
                .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
                .map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
            </div>
          </TabsContent>
          
          <TabsContent value="new">
            <div className="space-y-4 mt-4">
              {sortedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="top">
            <div className="space-y-4 mt-4">
              {sortedPosts
                .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
                .map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {loading && (
        <div className="flex justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && hasMore && (
        <div className="flex justify-center p-4">
          <Button 
            variant="outline" 
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No posts found. Be the first to create one!
        </div>
      )}

      {error && (
        <div className="text-center py-4 text-destructive">
          {error}
        </div>
      )}

      <div ref={loadMoreRef} className="h-1" />
    </div>
  );
};

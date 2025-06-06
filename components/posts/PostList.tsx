"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PostCard } from '../../components/posts/PostCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Clock, ChevronDown, Loader2, Flame, Rocket } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Post } from '@/types/post';

// Extend the Post type to include voting information
type PostWithVote = Post & {
  author: {
    id: string;
    username: string;
    avatar: string;
    karma: number;
  };
  community: {
    id: string;
    name: string;
    description: string;
    icon: string;
    members: number;
    createdAt: string;
  };
  userVote?: 'up' | 'down' | null;
  score?: number;
  upvotes?: number;
  downvotes?: number;
  commentCount?: number;
  isPinned?: boolean;
  updatedAt?: string;
  tags: string[];
};
import { Card } from '../../components/ui/card';
import { postService } from '../../src/services/postService';
import { voteService } from '../../src/services/voteService';
import { useToast } from '../../hooks/use-toast';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '../../src/hooks/useAuth';


interface PostListProps {
  initialPosts?: Post[];
  showJoinedCommunities?: boolean;
  className?: string;
}

export const PostList = ({ initialPosts, showJoinedCommunities = false }: PostListProps) => {
  // Cast initialPosts to PostWithVote[] if it exists, otherwise use an empty array
  const [posts, setPosts] = useState<PostWithVote[]>(() => {
    if (!initialPosts) return [];
    return initialPosts.map(post => ({
      ...post,
      author: {
        ...post.author,
        avatar: (post.author as any).avatarUrl || '',
        avatarUrl: (post.author as any).avatarUrl || '',
        karma: (post.author as any).karma || 0
      },
      community: {
        ...post.community,
        icon: (post.community as any).iconUrl || '',
        iconUrl: (post.community as any).iconUrl || '',
        memberCount: (post.community as any).memberCount || 0,
        members: (post.community as any).memberCount || 0
      },
      userVote: (post as any).userVote || null,
      score: post.score || 0,
      upvotes: (post as any).upvotes || 0,
      downvotes: (post as any).downvotes || 0,
      commentCount: (post as any).commentCount || 0,
      isPinned: (post as any).isPinned || false,
      updatedAt: (post as any).updatedAt || post.createdAt,
      tags: (post as any).tags?.map((tag: { id: string; name: string; usageCount: number; createdAt: string; updatedAt: string }) => ({
        id: tag.id,
        name: tag.name,
        usageCount: tag.usageCount,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt
      })) || []
    } as PostWithVote));
  });
  const { user, setIsLoginModalOpen } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('new');
  const [timeFilter, setTimeFilter] = useState<string>('today');
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [votingStates, setVotingStates] = useState<{[key: string]: boolean}>({});
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });
  const { toast } = useToast();
  
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
      
      // Map API response to PostWithVote type
      const uiPosts: PostWithVote[] = items.map((apiPost: any) => {
        const post: PostWithVote = {
          id: apiPost.id,
          title: apiPost.title,
          content: apiPost.content || '',
          imageUrl: apiPost.imageUrl,
          linkUrl: apiPost.linkUrl,
          type: apiPost.type,
          contentType: apiPost.contentType || 'text',
          author: {
            id: apiPost.author.id,
            username: apiPost.author.username,
            avatar: apiPost.author.avatarUrl || '',
            avatarUrl: apiPost.author.avatarUrl || '',
            karma: apiPost.author.karma || 0
          },
          community: {
            id: apiPost.community.id,
            name: apiPost.community.name,
            icon: apiPost.community.iconUrl || '',
            iconUrl: apiPost.community.iconUrl || '',
            description: apiPost.community.description || '',
            members: apiPost.community.memberCount || 0,
            memberCount: apiPost.community.memberCount || 0,
            createdAt: apiPost.community.createdAt
          },
          score: apiPost.score || 0,
          votes: apiPost.score || 0,
          upvotes: apiPost.upvotes || 0,
          downvotes: apiPost.downvotes || 0,
          commentCount: apiPost.commentCount || 0,
          isPinned: apiPost.isPinned || false,
          createdAt: apiPost.createdAt,
          updatedAt: apiPost.updatedAt || apiPost.createdAt,
          tags: apiPost.tags || [],
          userVote: apiPost.userVote || null
        };
        return post;
      });
      
      setPosts(prev => reset ? uiPosts : [...prev, ...uiPosts] as PostWithVote[]);
      setHasMore(response?.meta?.currentPage < response?.meta?.totalPages);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      toast({
      title: "Error",
      description: "Failed to load posts",
      variant: "destructive"
    });
    } finally {
      setLoading(false);
    }
  }, [showJoinedCommunities, toast]);
  
  // Initial load and when sort changes
  useEffect(() => {
    fetchPosts(1, sortBy, true);
  }, [sortBy, showJoinedCommunities, fetchPosts]);
  
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, sortBy, false);
    }
  };
  
  const handleSortChange = (value: 'hot' | 'new' | 'top') => {
    if (value === sortBy) return;
    setSortBy(value);
    setPage(1);
  };

  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value);
    // Refresh posts when time filter changes
    fetchPosts(1, sortBy, true);
  };
  
  // Sort posts by creation date (newest first)
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [posts]);
  
  // Get the most recent post
  const mostRecentPost = sortedPosts[0] as PostWithVote;

  const handleVote = async (postId: string, voteType: 'upvote' | 'downvote') => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    setVotingStates(prev => ({ ...prev, [postId]: true }));
    
    try {
      const response = voteType === 'upvote' 
        ? await voteService.upvote(postId)
        : await voteService.downvote(postId);
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              score: response.score, 
              votes: response.score,
              userVote: voteType === 'upvote' ? 'up' : 'down' as const,
              upvotes: response.upvotes !== undefined ? response.upvotes : post.upvotes,
              downvotes: response.downvotes !== undefined ? response.downvotes : post.downvotes
            } as PostWithVote
          : post
      ));
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to submit vote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setVotingStates(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleRemoveVote = async (postId: string) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    setVotingStates(prev => ({ ...prev, [postId]: true }));
    
    try {
      const response = await voteService.removeVote(postId);
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              score: response.score, 
              votes: response.score,
              userVote: null,
              upvotes: response.upvotes !== undefined ? response.upvotes : post.upvotes,
              downvotes: response.downvotes !== undefined ? response.downvotes : post.downvotes
            } as PostWithVote
          : post
      ));
    } catch (error) {
      console.error('Error removing vote:', error);
      toast({
        title: "Error",
        description: "Failed to remove vote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setVotingStates(prev => ({ ...prev, [postId]: false }));
    }
  };

  return (
    <div className="w-full space-y-4">
      <h2 className="text-xl font-semibold pb-2 border-b border-border">
        {showJoinedCommunities ? 'Your Communities' : 'Latest Posts'}
      </h2>
      {/* Most Recent Post */}
      {loading && page === 1 ? (
        <Card className="p-4">
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </Card>
      ) : error ? (
        <Card className="p-4">
          <div className="text-center p-4 text-red-500">{error}</div>
        </Card>
      ) : mostRecentPost ? (
        <PostCard 
          post={{
            ...mostRecentPost,
            tags: mostRecentPost.tags?.map((tag: string | { name: string }) => typeof tag === 'string' ? tag : tag?.name || '') || []
          }}
          onVote={handleVote}
          onRemoveVote={handleRemoveVote}
          isVoting={votingStates[mostRecentPost.id] || false}
        />
      ) : null}

      {/* All Posts */}
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            <Tabs defaultValue="new" value={sortBy} onValueChange={(value) => handleSortChange(value as 'hot' | 'new' | 'top')}>
              <TabsList>
                <TabsTrigger 
                  value="hot" 
                  className="gap-1.5"
                >
                  <Flame className="h-4 w-4" />
                  <span className="hidden sm:inline">Hot</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="new" 
                  className="gap-1.5"
                >
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">New</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="top" 
                  className="gap-1.5"
                >
                  <Rocket className="h-4 w-4" />
                  <span className="hidden sm:inline">Top</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <span>
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
        </div>

        {loading && page !== 1 ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post, index) => (
              // Skip the first post if it's the most recent one (already shown above)
              index === 0 && post.id === mostRecentPost?.id ? null : (
                <PostCard 
                  key={post.id}
                  post={{
                    ...post,
                    author: {
                      ...post.author,
                      avatar: 'avatar' in post.author ? post.author.avatar : (post.author as any).avatarUrl || ''
                    },
                    community: {
                      id: post.community.id,
                      name: post.community.name,
                      description: post.community.description || '',
                      icon: 'icon' in post.community ? post.community.icon : (post.community as any).iconUrl || '',
                      members: 'members' in post.community ? post.community.members : (post.community as any).memberCount || 0,
                      createdAt: post.community.createdAt
                    },
                    userVote: post.userVote,
                    score: post.score
                  } as PostWithVote}
                  onVote={handleVote}
                  onRemoveVote={handleRemoveVote}
                  isVoting={votingStates[post.id] || false}
                />
              )
            ))}
            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center pt-4">
                <Button 
                  variant="outline" 
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            No posts found. Be the first to create one!
          </div>
        )}
      </div>
    </div>
  );
};

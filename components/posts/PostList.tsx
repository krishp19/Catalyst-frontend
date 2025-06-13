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
import { Post } from '../../src/types/post';
import { PostWithVote } from '../../src/types/post.types';

// Using shared PostWithVote type from src/types/post.types
import { Card } from '../../components/ui/card';
import { postService } from '../../src/services/postService';
import { voteService } from '../../src/services/voteService';
import { useToast } from '../../hooks/use-toast';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '../../src/hooks/useAuth';


interface PostListProps {
  initialPosts?: Post[];
  showJoinedCommunities?: boolean;
  popular?: boolean;
  className?: string;
}

export const PostList = ({ initialPosts, showJoinedCommunities = false, popular = false, className }: PostListProps) => {
  // Cast initialPosts to PostWithVote[] if it exists, otherwise use an empty array
  // Initialize state
  const [posts, setPosts] = useState<PostWithVote[]>(() => {
    if (!initialPosts) return [];
    return initialPosts.map((post) => {
      // Ensure all required fields are present with proper defaults
      const author = {
        id: post.author?.id || '',
        username: post.author?.username || 'deleted',
        avatarUrl: post.author?.avatarUrl || ''
      };

      const community = {
        id: post.community?.id || '',
        name: post.community?.name || 'deleted',
        description: post.community?.description || '',
        iconUrl: post.community?.iconUrl || '',
        memberCount: post.community?.memberCount || 0,
        createdAt: post.community?.createdAt || new Date().toISOString()
      };

      // Create a new object with only the properties that PostWithVote expects
      const postWithVote: PostWithVote = {
        ...post,
        author,
        community,
        userVote: post.userVote || null,
        upvotes: post.upvotes || 0,
        downvotes: post.downvotes || 0,
        commentCount: post.commentCount || 0,
        isPinned: post.isPinned || false,
        updatedAt: post.updatedAt || post.createdAt,
        tags: post.tags || []
      };

      return postWithVote;
    });
  });

  const [loading, setLoading] = useState<boolean>(!initialPosts);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [votingStates, setVotingStates] = useState<Record<string, boolean>>({});
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
  });
  const { toast } = useToast();
  
  const fetchPosts = useCallback(async (pageNum: number, sort: string, reset = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      
      // If trying to fetch joined communities but user is not authenticated
      if (showJoinedCommunities && !isAuthenticated) {
        setError('Please log in to view posts from your communities');
        setLoading(false);
        return;
      }
      
      let response;
      if (popular) {
        // For popular posts, we only fetch once (no pagination)
        if (pageNum > 1) return;
        const popularResponse = await postService.getPopularPosts(10);
        response = {
          items: popularResponse.items,
          meta: {
            currentPage: 1,
            totalPages: 1,
            totalItems: popularResponse.items.length,
            itemCount: popularResponse.items.length,
            itemsPerPage: 10
          }
        };
      } else if (showJoinedCommunities) {
        response = await postService.getJoinedCommunityPosts({
          page: pageNum,
          limit: 10,
          sort
        });
      } else {
        response = await postService.getPosts({
          page: pageNum,
          limit: 10,
          sort
        });
      }
      
      // Ensure we have valid posts and update state
      const items = Array.isArray(response?.items) ? response.items : [];
      
      // Map API response to PostWithVote type
      const uiPosts: PostWithVote[] = items.map((apiPost: any) => ({
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
      }));
      
      setPosts(prev => (reset || popular) ? uiPosts : [...prev, ...uiPosts] as PostWithVote[]);
      setHasMore(!popular && response?.meta?.currentPage < response?.meta?.totalPages);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [showJoinedCommunities, popular, toast, isAuthenticated]);
  
  // Initial load and when sort changes
  useEffect(() => {
    if (initialPosts) {
      // If we have initialPosts, we don't need to fetch
      return;
    }
    
    const fetchInitialPosts = async () => {
      setPosts([]);
      setPage(1);
      setHasMore(true);
      await fetchPosts(1, sortBy, true);
    };
    
    fetchInitialPosts();
  }, [sortBy, showJoinedCommunities, popular, fetchPosts, initialPosts]);
  

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
  
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, sortBy, false);
    }
  }, [hasMore, loading, page, sortBy, fetchPosts]);
  
  // Load more posts when scrolled to bottom
  useEffect(() => {
    if (inView && hasMore && !loading) {
      handleLoadMore();
    }
  }, [inView, hasMore, loading, handleLoadMore]);

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
      {!showJoinedCommunities && (
        <h2 className="text-xl font-semibold pb-2 border-b border-border">
          Latest Posts
        </h2>
      )}
      {/* Most Recent Post */}
      {loading && page === 1 ? (
        <Card className="p-4">
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" data-testid="loading-spinner" />
          </div>
        </Card>
      ) : error ? (
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3">
              <svg 
                className="h-8 w-8 text-gray-500 dark:text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {showJoinedCommunities && !isAuthenticated 
                ? 'Authentication Required' 
                : 'Error Loading Posts'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              {showJoinedCommunities && !isAuthenticated 
                ? 'You need to be logged in to view posts from your communities.'
                : error}
            </p>
              {/* {showJoinedCommunities && !isAuthenticated && (
                <Button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="mt-2"
                >
                  Log In / Sign Up
                </Button>
              )} */}
          </div>
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
                      id: post.author.id,
                      username: post.author.username,
                      avatarUrl: 'avatarUrl' in post.author ? post.author.avatarUrl : (post.author as any).avatar || ''
                    },
                    community: {
                      id: post.community.id,
                      name: post.community.name,
                      description: post.community.description || '',
                      iconUrl: 'iconUrl' in post.community ? post.community.iconUrl : (post.community as any).icon || '',
                      memberCount: 'memberCount' in post.community ? post.community.memberCount : (post.community as any).members || 0,
                      createdAt: post.community.createdAt
                    },
                    userVote: post.userVote || null,
                    upvotes: post.upvotes || 0,
                    downvotes: post.downvotes || 0,
                    commentCount: post.commentCount || 0,
                    isPinned: post.isPinned || false,
                    updatedAt: post.updatedAt || post.createdAt,
                    tags: post.tags || []
                  }}
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

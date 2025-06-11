"use client";

import { useEffect, useState, useCallback } from 'react';
import { Post } from '@/types/post';

// Extend the Post type to include voting information
type PostWithVote = Omit<Post, 'author' | 'community' | 'tags'> & {
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  community: {
    id: string;
    name: string;
    description: string;
    iconUrl?: string;
    memberCount: number;
    createdAt: string;
  };
  tags: string[];
  userVote?: 'up' | 'down' | null;
  score?: number;
};

import { PostCard } from './PostCard';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { postService } from '@/services/postService';
import { voteService } from '@/services/voteService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface MorePostsProps {
  excludePostId?: string;
  limit?: number;
  communityId?: string;
}

export function MorePosts({ excludePostId, limit = 5, communityId }: MorePostsProps) {
  const { user, setIsLoginModalOpen } = useAuth();
  const [posts, setPosts] = useState<PostWithVote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [votingStates, setVotingStates] = useState<{[key: string]: boolean}>({});

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await postService.getPosts({
        page,
        limit,
        sort: 'new',
        communityId,
      });

      // Filter out the excluded post if needed
      // Map API response to match the expected Post type
      const mappedPosts = response.items.map((post: any) => ({
        ...post,
        author: {
          id: post.author.id,
          username: post.author.username,
          avatar: post.author.avatarUrl || '', // Map avatarUrl to avatar
          karma: 0 // Default value
        },
        community: {
          ...post.community,
          icon: post.community.iconUrl || '', // Map iconUrl to icon
          members: post.community.memberCount || 0
        },
        votes: post.score || 0,
        commentCount: post.commentCount || 0,
        isPinned: post.isPinned || false,
        tags: post.tags || []
      }));

      const filteredPosts = excludePostId
        ? mappedPosts.filter((post) => post.id !== excludePostId)
        : mappedPosts;

      setPosts((prev) => (page === 1 ? filteredPosts : [...prev, ...filteredPosts]));
      setHasMore(response.meta.currentPage < response.meta.totalPages);
      setError(null);
    } catch (err) {
      console.error('Error fetching more posts:', err);
      setError('Failed to load more posts');
    } finally {
      setLoading(false);
    }
  }, [page, limit, excludePostId, communityId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  if (loading && page === 1) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  if (posts.length === 0) {
    return null; // Don't show anything if there are no posts
  }

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
      
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              score: response.score, 
              userVote: voteType === 'upvote' ? 'up' : 'down' as const
            } as PostWithVote
          : post
      ));
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to submit vote. Please try again.');
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
      
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              score: response.score, 
              userVote: null 
            } as PostWithVote
          : post
      ));
    } catch (error) {
      console.error('Error removing vote:', error);
      toast.error('Failed to remove vote. Please try again.');
    } finally {
      setVotingStates(prev => ({ ...prev, [postId]: false }));
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold pb-2 border-b border-border">
        {communityId ? 'More from this community' : 'Explore All Communities'}
      </h2>
      <div className="space-y-4">
        {posts.map((post) => (
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
              }
            }}
            onVote={handleVote}
            onRemoveVote={handleRemoveVote}
            isVoting={votingStates[post.id] || false}
          />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { Comment, CommentResponse } from '../../src/services/commentService';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { ArrowUp, ArrowDown, MessageSquare, MoreHorizontal, Flag, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../lib/utils';
import { CommentForm } from './CommentForm';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAuth } from '../../src/hooks/useAuth';
import { commentService } from '../../src/services/commentService';
import { toast } from 'sonner';

interface CommentThreadProps {
  comment: Comment;
  depth?: number;
  onCommentUpdate?: () => void;
  postId: string;
}

export const CommentThread = ({ comment, depth = 0, onCommentUpdate, postId }: CommentThreadProps) => {
  const { user, setIsLoginModalOpen } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreReplies, setHasMoreReplies] = useState(false);
  const maxDepth = 5;

  const handleVote = async (type: 'upvote' | 'downvote') => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      if (comment.userVote === type) {
        await commentService.removeVote(comment.id);
      } else {
        if (type === 'upvote') {
          await commentService.upvoteComment(comment.id);
        } else {
          await commentService.downvoteComment(comment.id);
        }
      }
      onCommentUpdate?.();
    } catch (error) {
      console.error('Error voting on comment:', error);
      toast.error('Failed to vote on comment');
    }
  };

  const handleReply = async (content: string) => {
    if (!user) return;

    try {
      const newReply = await commentService.createComment({
        content,
        postId,
        parentId: comment.id,
      });
      setReplies(prev => [newReply, ...prev]);
      setIsReplying(false);
      onCommentUpdate?.();
      toast.success('Reply posted successfully');
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply');
    }
  };

  const loadReplies = async (page = 1) => {
    if (!showReplies && page === 1) {
      setShowReplies(true);
    }
    
    try {
      setLoadingReplies(true);
      const response = await commentService.getReplies(comment.id, page);
      
      if (page === 1) {
        setReplies(response.items);
      } else {
        setReplies(prev => [...prev, ...response.items]);
      }
      
      setCurrentPage(page);
      setHasMoreReplies(response.meta.currentPage < response.meta.totalPages);
    } catch (error) {
      console.error('Error loading replies:', error);
      toast.error('Failed to load replies');
    } finally {
      setLoadingReplies(false);
    }
  };

  const toggleReplies = () => {
    if (!showReplies) {
      loadReplies(1);
    } else {
      setShowReplies(false);
      setReplies([]);
      setCurrentPage(1);
    }
  };

  const loadMoreReplies = () => {
    if (!loadingReplies && hasMoreReplies) {
      loadReplies(currentPage + 1);
    }
  };

  return (
    <div className={cn(
      "group",
      depth > 0 && "ml-4 md:ml-8 border-l-2 border-muted pl-4"
    )}>
      <div className="flex gap-3">
        {/* Vote buttons */}
        <div className="flex flex-col items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-6 w-6 p-0",
              comment.userVote === 'upvote' && "text-orange-500 dark:text-orange-400"
            )}
            onClick={() => handleVote('upvote')}
          >
            <ArrowUp className="h-4 w-4" />
            <span className="sr-only">Upvote</span>
          </Button>
          
          <span className={cn(
            "text-xs font-medium",
            comment.userVote === 'upvote' && "text-orange-500 dark:text-orange-400",
            comment.userVote === 'downvote' && "text-blue-500 dark:text-blue-400"
          )}>
            {comment.score}
          </span>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-6 w-6 p-0",
              comment.userVote === 'downvote' && "text-blue-500 dark:text-blue-400"
            )}
            onClick={() => handleVote('downvote')}
          >
            <ArrowDown className="h-4 w-4" />
            <span className="sr-only">Downvote</span>
          </Button>
        </div>

        <div className="flex-1 space-y-2">
          {/* Comment header */}
          <div className="flex items-center gap-2 text-sm">
            <Avatar className="h-6 w-6">
              <AvatarImage src={comment.author.avatarUrl ?? undefined} alt={comment.author.username} />
              <AvatarFallback>{comment.author.username[0]}</AvatarFallback>
            </Avatar>
            <a href={`/user/${comment.author.username}`} className="font-medium hover:underline">
              {comment.author.username}
            </a>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt))} ago
            </span>
          </div>

          {/* Comment content */}
          <div className="text-sm">{comment.content}</div>

          {/* Comment actions */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-xs"
              onClick={() => user ? setIsReplying(!isReplying) : setIsLoginModalOpen(true)}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Reply
            </Button>

            {comment.replyCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={toggleReplies}
                disabled={loadingReplies}
              >
                {loadingReplies ? (
                  'Loading...'
                ) : (
                  <>
                    {showReplies ? (
                      <ChevronUp className="h-3 w-3 mr-1" />
                    ) : (
                      <ChevronDown className="h-3 w-3 mr-1" />
                    )}
                    {showReplies ? 'Hide' : 'Show'} {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                  </>
                )}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem className="text-destructive">
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Reply form */}
          {isReplying && (
            <div className="mt-4">
              <CommentForm 
                postId={postId}
                onCommentAdded={handleReply}
              />
            </div>
          )}

          {/* Nested replies */}
          {showReplies && (
            <div className="mt-4 space-y-4">
              {replies.map((reply) => (
                <CommentThread 
                  key={reply.id} 
                  comment={reply} 
                  depth={depth + 1}
                  onCommentUpdate={onCommentUpdate}
                  postId={postId}
                />
              ))}
              
              {hasMoreReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={loadMoreReplies}
                  disabled={loadingReplies}
                >
                  {loadingReplies ? 'Loading...' : 'Load more replies'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
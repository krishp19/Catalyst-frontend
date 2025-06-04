"use client";

import React from 'react';
import { Comment } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, MessageSquare, MoreHorizontal, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { CommentForm } from './CommentForm';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

interface CommentThreadProps {
  comment: Comment;
  depth?: number;
}

export const CommentThread = ({ comment, depth = 0 }: CommentThreadProps) => {
  const { user, setIsLoginModalOpen } = useAuth();
  const [votes, setVotes] = React.useState(comment.votes);
  const [voteStatus, setVoteStatus] = React.useState<'up' | 'down' | null>(null);
  const [isReplying, setIsReplying] = React.useState(false);
  const [replies, setReplies] = React.useState(comment.replies || []);
  const maxDepth = 5;

  const handleVote = (direction: 'up' | 'down') => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    if (voteStatus === direction) {
      setVotes(votes + (direction === 'up' ? -1 : 1));
      setVoteStatus(null);
    } else {
      const voteChange = direction === 'up' 
        ? (voteStatus === 'down' ? 2 : 1) 
        : (voteStatus === 'up' ? -2 : -1);
      setVotes(votes + voteChange);
      setVoteStatus(direction);
    }
  };

  const handleReply = (content: string) => {
    const newReply: Comment = {
      id: Date.now().toString(),
      content,
      author: {
        id: user!.id,
        username: user!.username,
        karma: user!.karma,
        avatar: user!.avatar,
      },
      votes: 1,
      createdAt: new Date().toISOString(),
    };

    setReplies([...replies, newReply]);
    setIsReplying(false);
  };

  return (
    <div className="group">
      <div className="flex gap-3">
        {/* Vote buttons */}
        <div className="flex flex-col items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-6 w-6 p-0",
              voteStatus === 'up' && "text-orange-500 dark:text-orange-400"
            )}
            onClick={() => handleVote('up')}
          >
            <ArrowUp className="h-4 w-4" />
            <span className="sr-only">Upvote</span>
          </Button>
          
          <span className={cn(
            "text-xs font-medium",
            voteStatus === 'up' && "text-orange-500 dark:text-orange-400",
            voteStatus === 'down' && "text-blue-500 dark:text-blue-400"
          )}>
            {votes}
          </span>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-6 w-6 p-0",
              voteStatus === 'down' && "text-blue-500 dark:text-blue-400"
            )}
            onClick={() => handleVote('down')}
          >
            <ArrowDown className="h-4 w-4" />
            <span className="sr-only">Downvote</span>
          </Button>
        </div>

        <div className="flex-1 space-y-2">
          {/* Comment header */}
          <div className="flex items-center gap-2 text-sm">
            <Avatar className="h-6 w-6">
              <AvatarImage src={comment.author.avatar} alt={comment.author.username} />
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
                onSubmit={handleReply}
                replyTo={comment.author.username}
                onCancel={() => setIsReplying(false)}
              />
            </div>
          )}

          {/* Nested replies */}
          {replies.length > 0 && depth < maxDepth && (
            <div className="mt-4 space-y-4 border-l-2 border-muted pl-4">
              {replies.map((reply) => (
                <CommentThread 
                  key={reply.id} 
                  comment={reply} 
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  ArrowUp, 
  ArrowDown, 
  MessageSquare, 
  Share, 
  Bookmark, 
  MoreHorizontal,
  Link2,
  Flag,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Post } from '../../lib/types';
import { Card } from '../../components/ui/card';
import Link from 'next/link';

interface PostWithVote extends Post {
  userVote?: 'up' | 'down' | null;
  score?: number;
}

interface PostCardProps {
  post: PostWithVote;
  onVote?: (postId: string, voteType: 'upvote' | 'downvote') => Promise<void>;
  onRemoveVote?: (postId: string) => Promise<void>;
  isVoting?: boolean;
}

export const PostCard = ({ 
  post, 
  onVote, 
  onRemoveVote, 
  isVoting = false 
}: PostCardProps) => {
  const [votes, setVotes] = useState(post.score || 0);
  const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(
    post.userVote || null
  );
  const [saved, setSaved] = useState(false);

  const handleVote = async (direction: 'up' | 'down') => {
    if (isVoting) return;
    
    const newVoteStatus = voteStatus === direction ? null : direction;
    
    try {
      if (newVoteStatus === null && onRemoveVote) {
        await onRemoveVote(post.id);
      } else if (onVote) {
        await onVote(post.id, direction === 'up' ? 'upvote' : 'downvote');
      }
      
      // Update local state optimistically
      if (newVoteStatus === null) {
        setVotes(voteStatus === 'up' ? votes - 1 : votes + 1);
      } else if (voteStatus === null) {
        setVotes(direction === 'up' ? votes + 1 : votes - 1);
      } else {
        setVotes(direction === 'up' ? votes + 2 : votes - 2);
      }
      
      setVoteStatus(newVoteStatus);
    } catch (error) {
      console.error('Error handling vote:', error);
    }
  };

  const toggleSaved = () => {
    setSaved(!saved);
  };

  return (
    <Card className="mb-4 overflow-hidden hover:border-accent-foreground/20 transition-colors">
      <div className="flex">
        {/* Vote Column */}
        <div className="bg-muted p-2 flex flex-col items-center min-w-[50px]">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-8 w-8 p-0 hover:bg-transparent hover:text-orange-500",
              voteStatus === 'up' && "text-orange-500"
            )}
            onClick={() => handleVote('up')}
            disabled={isVoting}
          >
            {isVoting && voteStatus === 'up' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
            <span className="sr-only">Upvote</span>
          </Button>
          
          <span className={cn(
            "text-sm font-medium py-1",
            voteStatus === 'up' && "text-orange-500 dark:text-orange-400",
            voteStatus === 'down' && "text-blue-500 dark:text-blue-400"
          )}>
            {votes}
          </span>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-8 w-8 p-0 hover:bg-transparent hover:text-blue-500",
              voteStatus === 'down' && "text-blue-500"
            )}
            onClick={() => handleVote('down')}
            disabled={isVoting}
          >
            {isVoting && voteStatus === 'down' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
            <span className="sr-only">Downvote</span>
          </Button>
        </div>
        
        {/* Content Column */}
        <div className="flex-1 p-3">
          {/* Post Header */}
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <div className="flex items-center">
              <Avatar className="h-5 w-5 mr-1">
                <AvatarImage src={post.community.icon} alt={post.community.name} />
                <AvatarFallback>{post.community.name[0]}</AvatarFallback>
              </Avatar>
              <a href={`/r/${post.community.name}`} className="font-medium hover:underline">
                r/{post.community.name}
              </a>
            </div>
            <span className="mx-1">•</span>
            <span>Posted by </span>
            <a href={`/user/${post.author.username}`} className="mx-1 hover:underline">
              u/{post.author.username}
            </a>
            <span className="mx-1">•</span>
            <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
          </div>
          
          {/* Post Title */}
          <Link href={`/post/${post.id}`} className="block group">
            <h2 className="text-lg font-medium mb-2 group-hover:text-blue-500 transition-colors">
              {post.title}
            </h2>
          </Link>
          
          {/* Post Content */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-2 mb-3">
              {post.tags.map((tag: string | { name: string }) => (
                <Badge key={typeof tag === 'string' ? tag : tag?.name || ''} variant="secondary" className="px-2 py-0 text-xs">
                  {typeof tag === 'string' ? tag : tag?.name || 'Unknown'}
                </Badge>
              ))}
            </div>
          )}
          
          {post.type === 'text' && (
            <div className="text-sm mb-4 line-clamp-3">{post.content}</div>
          )}
          
          {post.type === 'image' && post.imageUrl && (
            <div className="mb-4 rounded-md overflow-hidden border border-border max-w-[300px] mr-auto">
              <div 
                className="relative w-full" 
                style={{ 
                  paddingTop: '105.73%' /* 203/192 * 100% = 105.73% for 192:203 aspect ratio */
                }}
              >
                <div className="absolute inset-0 w-full h-full bg-muted p-1">
                  <Image 
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-contain"
                    quality={75}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/placeholder-image.jpg';
                    }}
                    unoptimized={post.imageUrl.endsWith('.gif')}
                  />
                </div>
              </div>
            </div>
          )}
          
          {post.type === 'link' && post.linkUrl && (
            <div className="mb-4">
              <a 
                href={post.linkUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center text-sm"
              >
                <Link2 className="h-4 w-4 mr-1" />
                {post.linkUrl}
              </a>
            </div>
          )}
          
          {/* Post Footer */}
          <div className="flex items-center text-xs text-muted-foreground mt-2">
            <Button variant="ghost" size="sm" className="gap-1 h-8" asChild>
              <Link href={`/post/${post.id}`}>
                <MessageSquare className="h-4 w-4" />
                <span>{post.commentCount} Comments</span>
              </Link>
            </Button>
            
            <Button variant="ghost" size="sm" className="gap-1 h-8">
              <Share className="h-4 w-4" />
              <span>Share</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("gap-1 h-8", saved && "text-yellow-500")}
              onClick={toggleSaved}
            >
              <Bookmark className="h-4 w-4" />
              <span>{saved ? "Saved" : "Save"}</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 h-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem className="gap-2">
                  <EyeOff className="h-4 w-4" />
                  <span>Hide</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Flag className="h-4 w-4" />
                  <span>Report</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2">
                  <Link2 className="h-4 w-4" />
                  <span>Copy link</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </Card>
  );
};
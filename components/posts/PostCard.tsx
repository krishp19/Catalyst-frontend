"use client";

import React, { useState } from 'react';
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
  EyeOff
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

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
  const [votes, setVotes] = useState(post.votes);
  const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(null);
  const [saved, setSaved] = useState(false);

  const handleVote = (direction: 'up' | 'down') => {
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
              "rounded-full h-8 w-8 p-0",
              voteStatus === 'up' && "text-orange-500 dark:text-orange-400"
            )}
            onClick={() => handleVote('up')}
          >
            <ArrowUp className="h-5 w-5" />
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
              "rounded-full h-8 w-8 p-0",
              voteStatus === 'down' && "text-blue-500 dark:text-blue-400"
            )}
            onClick={() => handleVote('down')}
          >
            <ArrowDown className="h-5 w-5" />
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
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="px-2 py-0 text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {post.contentType === 'text' && (
            <div className="text-sm mb-4 line-clamp-3">{post.content}</div>
          )}
          
          {post.contentType === 'image' && (
            <div className="mb-4 max-h-[400px] overflow-hidden rounded-md">
              <img 
                src={post.content as string} 
                alt={post.title} 
                className="w-full h-auto object-cover"
              />
            </div>
          )}
          
          {post.contentType === 'link' && (
            <a 
              href={post.content as string} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline flex items-center mb-4"
            >
              <Link2 className="h-3 w-3 mr-1" />
              {post.content as string}
            </a>
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
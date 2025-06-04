"use client";

import React from 'react';
import { Post } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface PostDetailsProps {
  post: Post;
}

export const PostDetails = ({ post }: PostDetailsProps) => {
  const [votes, setVotes] = React.useState(post.votes);
  const [voteStatus, setVoteStatus] = React.useState<'up' | 'down' | null>(null);
  const [saved, setSaved] = React.useState(false);

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

  return (
    <Card className="overflow-hidden">
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
        <div className="flex-1 p-4">
          {/* Post Header */}
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <div className="flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={post.community.icon} alt={post.community.name} />
                <AvatarFallback>{post.community.name[0]}</AvatarFallback>
              </Avatar>
              <a href={`/r/${post.community.name}`} className="font-medium hover:underline">
                r/{post.community.name}
              </a>
            </div>
            <span className="mx-1.5">•</span>
            <span>Posted by </span>
            <a href={`/user/${post.author.username}`} className="mx-1.5 hover:underline">
              u/{post.author.username}
            </a>
            <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
          </div>
          
          {/* Post Title */}
          <h1 className="text-2xl font-semibold mb-4">{post.title}</h1>
          
          {/* Post Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Post Content */}
          {post.contentType === 'text' && (
            <div className="text-base mb-4 whitespace-pre-wrap">{post.content}</div>
          )}
          
          {post.contentType === 'image' && (
            <div className="mb-4 rounded-md overflow-hidden">
              <img 
                src={post.content as string} 
                alt={post.title} 
                className="w-full h-auto"
              />
            </div>
          )}
          
          {post.contentType === 'link' && (
            <a 
              href={post.content as string} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline flex items-center mb-4"
            >
              <Link2 className="h-4 w-4 mr-2" />
              {post.content as string}
            </a>
          )}
          
          {/* Post Actions */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4 pt-4 border-t">
            <Button variant="ghost" size="sm" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              {post.commentCount} Comments
            </Button>
            
            <Button variant="ghost" size="sm" className="gap-2">
              <Share className="h-4 w-4" />
              Share
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("gap-2", saved && "text-yellow-500")}
              onClick={() => setSaved(!saved)}
            >
              <Bookmark className="h-4 w-4" />
              {saved ? "Saved" : "Save"}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
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
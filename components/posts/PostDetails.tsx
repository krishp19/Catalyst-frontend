"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Post } from '../../src/types/post';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
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
  ArrowBigUp,
  ArrowBigDown,
  Share2,
  BookmarkPlus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { cn } from '../../lib/utils';
import { postService } from '../../src/services/postService';
import { voteService } from '../../src/services/voteService';
import { toast } from 'sonner';
import { useAuth } from '../../src/hooks/useAuth';
import HtmlContent from '../common/HtmlContent';

interface PostDetailsProps {
  post: Post;
}

export function PostDetails({ post }: PostDetailsProps) {
  const { user, setIsLoginModalOpen } = useAuth();
  console.log('PostDetails - Auth State:', { 
    isAuthenticated: !!user,
    userId: user?.id,
    username: user?.username
  });
  const [votes, setVotes] = useState(post.score);
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleVote = async (type: 'upvote' | 'downvote') => {
    console.log('handleVote called with type:', type);
    console.log('Current user:', user);
    
    if (!user) {
      console.log('No user found, opening login modal');
      setIsLoginModalOpen(true);
      return;
    }

    if (isVoting) {
      console.log('Already voting, ignoring request');
      return;
    }
    
    // Set isVoting to true at the start of the voting process
    setIsVoting(true);

    try {
      setIsVoting(true);
      console.log('Making vote request...');

      // If user has already voted this way, remove the vote
      if (userVote === type) {
        console.log('Removing existing vote');
        const response = await voteService.removeVote(post.id);
        console.log('Remove vote response:', response);
        
        setVotes((prev) => prev - (type === 'upvote' ? 1 : -1));
        setUserVote(null);
      } else {
        // If user has voted the other way, remove that vote first
        if (userVote) {
          console.log('Removing previous vote');
          await voteService.removeVote(post.id);
          setVotes((prev) => prev - (userVote === 'upvote' ? 1 : -1));
        }

        // Add the new vote
        console.log('Adding new vote:', type);
        const response = await (type === 'upvote' 
          ? voteService.upvote(post.id)
          : voteService.downvote(post.id));
        console.log('Vote response:', response);
        
        setVotes((prev) => prev + (type === 'upvote' ? 1 : -1));
        setUserVote(type);
      }
    } catch (error) {
      console.error('Vote error:', error);
      toast.error('Failed to vote. Please try again.');
    } finally {
      setIsVoting(false);
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
              userVote === 'upvote' && "text-orange-500 dark:text-orange-400"
            )}
            onClick={() => {
              console.log('Upvote button clicked - PostDetails');
              console.log('Post ID:', post.id);
              console.log('User:', user);
              handleVote('upvote');
            }}
            disabled={isVoting}
            aria-disabled={isVoting}
            data-testid="upvote-button"
          >
            <ArrowBigUp className="h-5 w-5" />
            <span className="sr-only">Upvote</span>
          </Button>
          
          <span className={cn(
            "text-sm font-medium py-1",
            userVote === 'upvote' && "text-orange-500 dark:text-orange-400",
            userVote === 'downvote' && "text-blue-500 dark:text-blue-400"
          )}>
            {votes}
          </span>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "rounded-full h-8 w-8 p-0",
              userVote === 'downvote' && "text-blue-500 dark:text-blue-400"
            )}
            onClick={() => {
              console.log('Downvote button clicked - PostDetails');
              console.log('Post ID:', post.id);
              console.log('User:', user);
              handleVote('downvote');
            }}
            disabled={isVoting}
            aria-disabled={isVoting}
            data-testid="downvote-button"
          >
            <ArrowBigDown className="h-5 w-5" />
            <span className="sr-only">Downvote</span>
          </Button>
        </div>
        
        {/* Content Column */}
        <div className="flex-1 p-4">
          {/* Post Header */}
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <div className="flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={post.community.iconUrl} alt={post.community.name} />
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
              {post.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Post Content */}
          {post.type === 'text' && post.content && (
            <div className="text-base mb-4">
              <HtmlContent html={post.content} className="prose dark:prose-invert max-w-none" />
            </div>
          )}
          
          {post.type === 'image' && post.imageUrl && (
            <div className="mb-4 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <div className="relative w-full max-w-4xl">
                <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
                  <Image 
                    src={post.imageUrl} 
                    alt={post.title} 
                    fill
                    sizes="(max-width: 800px) 100vw, 800px"
                    className="object-contain p-4"
                    priority
                  />
                </div>
              </div>
            </div>
          )}
          
          {post.type === 'link' && post.linkUrl && (
            <a 
              href={post.linkUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline flex items-center mb-4"
            >
              <Link2 className="h-4 w-4 mr-2" />
              {post.linkUrl}
            </a>
          )}
          
          {/* Post Actions */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4 pt-4 border-t">
            <Button variant="ghost" size="sm" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              {post.commentCount} Comments
            </Button>
            
            <Button variant="ghost" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("gap-2", saved && "text-yellow-500")}
              onClick={() => setSaved(!saved)}
              data-testid="save-button"
            >
              <BookmarkPlus className="h-4 w-4" />
              {saved ? "Saved" : "Save"}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2" data-testid="dropdown-trigger">
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
}
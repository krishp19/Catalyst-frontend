"use client";

import React from 'react';
import { Comment } from '@/lib/types';
import { CommentForm } from './CommentForm';
import { CommentThread } from './CommentThread';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

// Mock comments data
const mockComments: Comment[] = [
  {
    id: '1',
    content: "This is really interesting! I've been using aspect-ratio in my projects and it's been a game changer.",
    author: {
      id: '1',
      username: 'css_master',
      karma: 1234,
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=css_master',
    },
    votes: 42,
    createdAt: '2024-03-20T10:00:00.000Z',
    replies: [
      {
        id: '2',
        content: "Agreed! It's much cleaner than the old padding hack.",
        author: {
          id: '2',
          username: 'web_dev_pro',
          karma: 567,
          avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=web_dev_pro',
        },
        votes: 15,
        createdAt: '2024-03-20T10:30:00.000Z',
        replies: [
          {
            id: '3',
            content: "Don't forget about browser support though - might still need fallbacks for older browsers.",
            author: {
              id: '3',
              username: 'browser_guru',
              karma: 890,
              avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=browser_guru',
            },
            votes: 8,
            createdAt: '2024-03-20T11:00:00.000Z',
          }
        ]
      }
    ]
  },
  {
    id: '4',
    content: "Great explanation! Could you elaborate more on how this affects performance compared to other methods?",
    author: {
      id: '4',
      username: 'perf_expert',
      karma: 2345,
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=perf_expert',
    },
    votes: 28,
    createdAt: '2024-03-20T12:00:00.000Z',
  }
];

interface CommentSectionProps {
  postId: string;
}

export const CommentSection = ({ postId }: CommentSectionProps) => {
  const { user, setIsLoginModalOpen } = useAuth();
  const [comments, setComments] = React.useState<Comment[]>(mockComments);
  const [sortBy, setSortBy] = React.useState<'best' | 'new' | 'old'>('best');

  const handleAddComment = (content: string) => {
    const newComment: Comment = {
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

    setComments([newComment, ...comments]);
  };

  const sortedComments = React.useMemo(() => {
    const sorted = [...comments];
    switch (sortBy) {
      case 'new':
        return sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'old':
        return sorted.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      default: // 'best'
        return sorted.sort((a, b) => b.votes - a.votes);
    }
  }, [comments, sortBy]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Comments</h2>
        <div className="flex gap-2">
          <Button 
            variant={sortBy === 'best' ? 'secondary' : 'ghost'} 
            size="sm"
            onClick={() => setSortBy('best')}
          >
            Best
          </Button>
          <Button 
            variant={sortBy === 'new' ? 'secondary' : 'ghost'} 
            size="sm"
            onClick={() => setSortBy('new')}
          >
            New
          </Button>
          <Button 
            variant={sortBy === 'old' ? 'secondary' : 'ghost'} 
            size="sm"
            onClick={() => setSortBy('old')}
          >
            Old
          </Button>
        </div>
      </div>

      {user ? (
        <CommentForm onSubmit={handleAddComment} />
      ) : (
        <div className="bg-muted p-4 rounded-md text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Log in or sign up to leave a comment
          </p>
          <Button onClick={() => setIsLoginModalOpen(true)}>
            Log In / Sign Up
          </Button>
        </div>
      )}

      <div className="space-y-4 mt-6">
        {sortedComments.map((comment) => (
          <CommentThread key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
};
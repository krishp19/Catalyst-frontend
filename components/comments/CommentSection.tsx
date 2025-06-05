"use client";

import React, { useState } from 'react';
import { Comment } from '../../src/types/comment';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { MessageSquare, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '../../src/hooks/useAuth';

interface CommentSectionProps {
  postId: string;
}

export const CommentSection = ({ postId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [sortBy, setSortBy] = useState<'top' | 'new' | 'controversial'>('top');
  const { user } = useAuth();

  const handleAddComment = (newComment: Comment) => {
    const commentWithId: Comment = {
      ...newComment,
      id: Date.now().toString(),
      votes: 0,
      createdAt: new Date().toISOString()
    };
    setComments(prev => [commentWithId, ...prev]);
  };

  const sortedComments = React.useMemo(() => {
    const sorted = [...comments];
    switch (sortBy) {
      case 'new':
        return sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'controversial':
        return sorted.sort((a, b) => Math.abs(b.votes) - Math.abs(a.votes));
      default: // 'top'
        return sorted.sort((a, b) => b.votes - a.votes);
    }
  }, [comments, sortBy]);

  return (
    <Card className="border border-orange-100 dark:border-orange-900/30 bg-white dark:bg-gray-800 shadow-sm">
      <div className="p-4 border-b border-orange-100 dark:border-orange-900/30">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Comments</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={sortBy === 'top' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('top')}
              className={sortBy === 'top' ? 'bg-orange-500 hover:bg-orange-600' : 'text-orange-600 dark:text-orange-400'}
            >
              <ArrowUp className="h-4 w-4 mr-1" />
              Top
            </Button>
            <Button
              variant={sortBy === 'new' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('new')}
              className={sortBy === 'new' ? 'bg-orange-500 hover:bg-orange-600' : 'text-orange-600 dark:text-orange-400'}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              New
            </Button>
            <Button
              variant={sortBy === 'controversial' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('controversial')}
              className={sortBy === 'controversial' ? 'bg-orange-500 hover:bg-orange-600' : 'text-orange-600 dark:text-orange-400'}
            >
              <ArrowDown className="h-4 w-4 mr-1" />
              Controversial
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <CommentForm postId={postId} onCommentAdded={handleAddComment} />
        <CommentList comments={sortedComments} />
      </div>
    </Card>
  );
};
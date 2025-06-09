"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Comment, CommentResponse } from '../../src/services/commentService';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { MessageSquare, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '../../src/hooks/useAuth';
import { commentService } from '../../src/services/commentService';
import { toast } from 'sonner';

interface CommentSectionProps {
  postId: string;
}

// Extend the Comment interface to include replies
interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
}

export const CommentSection = ({ postId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'top' | 'new' | 'controversial'>('top');
  const { user } = useAuth();

  const buildCommentTree = (flatComments: Comment[]): Comment[] => {
    const commentMap = new Map<string, Comment>();
    const commentTree: Comment[] = [];

    // First pass: Create a map of all comments and initialize replies array
    flatComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: Build the tree
    flatComments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          if (!parent.replies) parent.replies = [];
          parent.replies.push(commentWithReplies);
        }
      } else {
        commentTree.push(commentWithReplies);
      }
    });

    return commentTree;
  };

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await commentService.getComments(postId, 1, 50);
      const commentTree = buildCommentTree(response.items);
      setComments(commentTree);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAddComment = async (content: string) => {
    if (!user) return;
    
    try {
      const newComment = await commentService.createComment({
        content,
        postId,
      });
      setComments(prev => [newComment, ...prev]);
      toast.success('Comment posted successfully');
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Failed to post comment');
    }
  };

  const sortedComments = React.useMemo(() => {
    const sorted = [...comments];
    switch (sortBy) {
      case 'new':
        return sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'controversial':
        return sorted.sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
      default: // 'top'
        return sorted.sort((a, b) => b.score - a.score);
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
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <CommentList 
            comments={sortedComments} 
            onCommentUpdate={fetchComments}
            postId={postId}
          />
        )}
      </div>
    </Card>
  );
};
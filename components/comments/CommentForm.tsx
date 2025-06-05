"use client";

import React from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../../src/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Comment } from '../../src/types/comment';

interface CommentFormProps {
  postId: string;
  onCommentAdded: (comment: Comment) => void;
}

export const CommentForm = ({ postId, onCommentAdded }: CommentFormProps) => {
  const [content, setContent] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const newComment: Comment = {
        id: Date.now().toString(),
        content: content.trim(),
        author: {
          id: user.id,
          username: user.username,
          karma: user.karma || 0,
          avatar: user.avatar
        },
        postId,
        votes: 0,
        createdAt: new Date().toISOString(),
        replies: []
      };
      onCommentAdded(newComment);
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.avatar} alt={user?.username} />
          <AvatarFallback>{user?.username?.[0]}</AvatarFallback>
        </Avatar>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What are your thoughts?"
          className="min-h-[100px] resize-none"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={!content.trim() || isSubmitting}>
          {isSubmitting ? 'Posting...' : 'Post'}
        </Button>
      </div>
    </form>
  );
};
"use client";

import React from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../../src/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface CommentFormProps {
  postId: string;
  onCommentAdded: (content: string) => void;
}

export const CommentForm = ({ postId, onCommentAdded }: CommentFormProps) => {
  const [content, setContent] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { user, setIsLoginModalOpen } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await onCommentAdded(content.trim());
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.avatarUrl ?? undefined} alt={user?.username ?? ''} />
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
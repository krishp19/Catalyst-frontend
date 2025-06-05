import React from 'react';
import { Comment } from '../../src/types/comment';
import { CommentThread } from './CommentThread';

interface CommentListProps {
  comments: Comment[];
}

export const CommentList = ({ comments }: CommentListProps) => {
  return (
    <div className="space-y-4 mt-6">
      {comments.map((comment) => (
        <CommentThread key={comment.id} comment={comment} />
      ))}
    </div>
  );
}; 
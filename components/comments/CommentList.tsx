import React from 'react';
import { Comment } from '../../src/services/commentService';
import { CommentThread } from './CommentThread';

interface CommentListProps {
  comments: Comment[];
  onCommentUpdate?: () => void;
  postId: string;
  depth?: number;
}

export const CommentList = ({ 
  comments, 
  onCommentUpdate, 
  postId, 
  depth = 0 
}: CommentListProps) => {
  if (comments.length === 0 && depth === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div 
      className="space-y-4"
      style={{
        marginTop: depth > 0 ? '0.5rem' : '1.5rem',
        ...(depth > 0 ? {
          marginLeft: '1rem',
          paddingLeft: '1rem',
          borderLeft: '2px solid hsl(var(--muted))'
        } : {})
      }}>
      {comments.map((comment) => (
        <div key={comment.id} className="space-y-2">
          <CommentThread 
            comment={comment} 
            onCommentUpdate={onCommentUpdate}
            postId={postId}
            depth={depth}
          />
          {comment.replies && comment.replies.length > 0 && (
            <CommentList 
              comments={comment.replies} 
              onCommentUpdate={onCommentUpdate}
              postId={postId}
              depth={depth + 1}
            />
          )}
        </div>
      ))}
    </div>
  );
};
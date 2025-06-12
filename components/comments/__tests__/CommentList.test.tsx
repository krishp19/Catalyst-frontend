import React from 'react';
import { render, screen } from '@testing-library/react';
import { CommentList } from '../CommentList';
import { Comment } from '../../../src/services/commentService';
import * as CommentThreadModule from '../CommentThread';

// Mock the CommentThread component
jest.mock('../CommentThread', () => ({
  CommentThread: jest.fn(() => <div data-testid="comment-thread" />),
}));

const mockCommentThread = CommentThreadModule.CommentThread as jest.Mock;

describe('CommentList', () => {
  const postId = '123';
  const mockComment: Comment = {
      id: '1',
      content: 'Test comment',
      author: { id: 'user1', username: 'testuser' },
      createdAt: '2025-06-12T10:00:00Z',
      replies: [],
      postId: '',
      authorId: '',
      score: 0,
      replyCount: 0,
      updatedAt: ''
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no comments at depth 0', () => {
    const { container } = render(<CommentList comments={[]} postId={postId} />);
    
    const emptyState = container.querySelector('.text-center');
    expect(emptyState).toBeInTheDocument();
    expect(emptyState).toHaveTextContent('No comments yet. Be the first to comment!');
    expect(emptyState).toHaveClass('text-center py-8 text-muted-foreground');
  });

  it('does not render empty state when no comments at depth > 0', () => {
    render(<CommentList comments={[]} postId={postId} depth={1} />);
    
    expect(screen.queryByText('No comments yet. Be the first to comment!')).not.toBeInTheDocument();
  });

  it('renders comments with CommentThread components', () => {
    const comments = [mockComment, { ...mockComment, id: '2' }];
    render(<CommentList comments={comments} postId={postId} />);
    
    expect(mockCommentThread).toHaveBeenCalledTimes(2);
    expect(mockCommentThread).toHaveBeenCalledWith(
      expect.objectContaining({
        comment: comments[0],
        postId,
        depth: 0,
      }),
      {}
    );
    expect(mockCommentThread).toHaveBeenCalledWith(
      expect.objectContaining({
        comment: comments[1],
        postId,
        depth: 0,
      }),
      {}
    );
  });

  it('renders nested comments recursively', () => {
    const nestedComment: Comment = {
      ...mockComment,
      replies: [{ ...mockComment, id: '2' }],
    };
    render(<CommentList comments={[nestedComment]} postId={postId} />);
    
    expect(mockCommentThread).toHaveBeenCalledTimes(2);
    expect(mockCommentThread).toHaveBeenCalledWith(
      expect.objectContaining({
        comment: nestedComment,
        postId,
        depth: 0,
      }),
      {}
    );
    expect(mockCommentThread).toHaveBeenCalledWith(
      expect.objectContaining({
        comment: nestedComment.replies[0],
        postId,
        depth: 1,
      }),
      {}
    );
  });

  it('applies correct styling for depth 0', () => {
    const { container } = render(<CommentList comments={[mockComment]} postId={postId} depth={0} />);
    
    const containerDiv = container.querySelector('.space-y-4');
    expect(containerDiv).toHaveStyle({ marginTop: '1.5rem' });
    expect(containerDiv).not.toHaveStyle({ 
      marginLeft: '1rem', 
      paddingLeft: '1rem', 
      borderLeft: '2px solid hsl(var(--muted))' 
    });
  });

  it('applies correct styling for depth > 0', () => {
    const { container } = render(<CommentList comments={[mockComment]} postId={postId} depth={1} />);
    
    const containerDiv = container.querySelector('.space-y-4');
    expect(containerDiv).toHaveStyle({
      marginTop: '0.5rem',
      marginLeft: '1rem',
      paddingLeft: '1rem',
      borderLeft: '2px solid hsl(var(--muted))',
    });
  });

  it('passes onCommentUpdate prop to CommentThread', () => {
    const onCommentUpdate = jest.fn();
    render(<CommentList comments={[mockComment]} postId={postId} onCommentUpdate={onCommentUpdate} />);
    
    expect(mockCommentThread).toHaveBeenCalledWith(
      expect.objectContaining({
        onCommentUpdate,
      }),
      {}
    );
  });

  it('renders multiple comments with unique keys', () => {
    const comments = [
      { ...mockComment, id: '1' },
      { ...mockComment, id: '2' },
    ];
    render(<CommentList comments={comments} postId={postId} />);
    
    const commentThreads = screen.getAllByTestId('comment-thread');
    expect(commentThreads).toHaveLength(2);
  });

  it('does not render replies section when comment has no replies', () => {
    render(<CommentList comments={[mockComment]} postId={postId} />);
    
    // Since CommentThread is mocked, we check if recursive CommentList is not called
    expect(mockCommentThread).toHaveBeenCalledTimes(1);
  });

  it('renders with default depth when not provided', () => {
    render(<CommentList comments={[mockComment]} postId={postId} />);
    
    expect(mockCommentThread).toHaveBeenCalledWith(
      expect.objectContaining({
        depth: 0,
      }),
      {}
    );
  });
});
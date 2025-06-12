import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentSection } from '../CommentSection';
import { commentService, Comment } from '../../../src/services/commentService';
import { useAuth } from '../../../src/hooks/useAuth';
import * as CommentFormModule from '../CommentForm';
import * as CommentListModule from '../CommentList';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('../../../src/services/commentService');
jest.mock('../../../src/hooks/useAuth');
jest.mock('../CommentForm', () => ({
  CommentForm: jest.fn(() => <div data-testid="comment-form" />),
}));
jest.mock('../CommentList', () => ({
  CommentList: jest.fn(() => <div data-testid="comment-list" />),
}));
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockCommentService = commentService as jest.Mocked<typeof commentService>;
const mockUseAuth = useAuth as jest.Mock;
const mockCommentForm = CommentFormModule.CommentForm as jest.Mock;
const mockCommentList = CommentListModule.CommentList as jest.Mock;
const mockToast = toast as jest.Mocked<typeof toast>;

describe('CommentSection', () => {
  const postId = '123';
  const mockUser = { id: 'user1', username: 'testuser' };
  const mockComment: Comment = {
    id: '1',
    content: 'Test comment',
    author: {
      id: mockUser.id,
      username: mockUser.username,
      avatarUrl: 'https://example.com/avatar.jpg'
    },
    postId: 'post-123',
    score: 10,
    userVote: null,
    replyCount: 0,
    createdAt: '2025-06-12T10:00:00Z',
    updatedAt: '2025-06-12T10:00:00Z',
    authorId: mockUser.id,
    replies: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: mockUser });
    mockCommentService.getComments.mockResolvedValue({ 
      items: [],
      meta: {
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1
      }
    });
  });

  it('renders comment section with header and sorting buttons', () => {
    render(<CommentSection postId={postId} />);

    expect(screen.getByText('Comments')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /top/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /controversial/i })).toBeInTheDocument();
    expect(screen.getByTestId('comment-form')).toBeInTheDocument();
  });

  it('shows loading spinner while fetching comments', () => {
    const { container } = render(<CommentSection postId={postId} />);
    
    // Find the spinner by its class
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(screen.queryByTestId('comment-list')).not.toBeInTheDocument();
  });

  it('renders CommentList when loading is complete', async () => {
    mockCommentService.getComments.mockResolvedValue({ 
      items: [mockComment],
      meta: {
        totalItems: 1,
        itemCount: 1,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1
      }
    });

    render(<CommentSection postId={postId} />);

    await waitFor(() => {
      expect(screen.queryByTestId('animate-spin')).not.toBeInTheDocument();
      expect(screen.getByTestId('comment-list')).toBeInTheDocument();
    });

    expect(mockCommentList).toHaveBeenCalledWith(
      expect.objectContaining({
        comments: [{ ...mockComment, replies: [] }],
        postId,
        onCommentUpdate: expect.any(Function),
      }),
      {}
    );
  });

  it('fetches comments on mount', async () => {
    render(<CommentSection postId={postId} />);

    await waitFor(() => {
      expect(mockCommentService.getComments).toHaveBeenCalledWith(postId, 1, 50);
    });
  });

  it('displays error toast when fetching comments fails', async () => {
    mockCommentService.getComments.mockRejectedValue(new Error('Fetch error'));

    render(<CommentSection postId={postId} />);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to load comments');
    });
  });

  it('builds comment tree correctly', async () => {
    const parentComment = { ...mockComment, id: '1', parentId: undefined };
    const replyComment = { ...mockComment, id: '2', parentId: '1' };
    mockCommentService.getComments.mockResolvedValue({ 
      items: [parentComment, replyComment],
      meta: {
        totalItems: 2,
        itemCount: 2,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1
      }
    });

    render(<CommentSection postId={postId} />);

    await waitFor(() => {
      expect(mockCommentList).toHaveBeenCalledWith(
        expect.objectContaining({
          comments: [
            {
              ...parentComment,
              replies: [{ ...replyComment, replies: [] }],
            },
          ],
        }),
        {}
      );
    });
  });

  it('adds new comment successfully', async () => {
    const newComment = { ...mockComment, id: '2', content: 'New comment' };
    mockCommentService.createComment.mockResolvedValue(newComment);

    render(<CommentSection postId={postId} />);

    const commentFormProps = mockCommentForm.mock.calls[0][0];
    await commentFormProps.onCommentAdded('New comment');

    await waitFor(() => {
      expect(mockCommentService.createComment).toHaveBeenCalledWith({
        content: 'New comment',
        postId,
      });
      expect(mockToast.success).toHaveBeenCalledWith('Comment posted successfully');
      expect(mockCommentList).toHaveBeenCalledWith(
        expect.objectContaining({
          comments: expect.arrayContaining([{ ...newComment, replies: [] }]),
        }),
        {}
      );
    });
  });

  it('displays error toast when adding comment fails', async () => {
    mockCommentService.createComment.mockRejectedValue(new Error('Create error'));

    render(<CommentSection postId={postId} />);

    const commentFormProps = mockCommentForm.mock.calls[0][0];
    await commentFormProps.onCommentAdded('New comment');

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to post comment');
    });
  });

  it('sorts comments by top score', async () => {
    const comments: Comment[] = [
      { 
        ...mockComment, 
        id: '1', 
        score: 10, 
        parentId: undefined,
        replies: []
      },
      { 
        ...mockComment, 
        id: '2', 
        score: 20, 
        parentId: undefined,
        replies: []
      },
    ];
    mockCommentService.getComments.mockResolvedValue({ 
      items: comments,
      meta: {
        totalItems: comments.length,
        itemCount: comments.length,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1
      }
    });

    render(<CommentSection postId={postId} />);

    await waitFor(() => {
      expect(mockCommentList).toHaveBeenCalledWith(
        expect.objectContaining({
          comments: [
            { ...comments[1], replies: [] },
            { ...comments[0], replies: [] },
          ],
        }),
        {}
      );
    });
  });

  it('sorts comments by new when selected', async () => {
    const comments: Comment[] = [
      { 
        ...mockComment, 
        id: '1', 
        createdAt: '2025-06-12T10:00:00Z',
        updatedAt: '2025-06-12T10:00:00Z',
        parentId: undefined,
        replies: []
      },
      { 
        ...mockComment, 
        id: '2', 
        createdAt: '2025-06-12T11:00:00Z',
        updatedAt: '2025-06-12T11:00:00Z',
        parentId: undefined,
        replies: []
      },
    ];
    mockCommentService.getComments.mockResolvedValue({ 
      items: comments,
      meta: {
        totalItems: comments.length,
        itemCount: comments.length,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1
      }
    });

    render(<CommentSection postId={postId} />);

    await userEvent.click(screen.getByRole('button', { name: /new/i }));

    await waitFor(() => {
      expect(mockCommentList).toHaveBeenCalledWith(
        expect.objectContaining({
          comments: [
            { ...comments[1], replies: [] },
            { ...comments[0], replies: [] },
          ],
        }),
        {}
      );
    });
  });

  it('sorts comments by controversial when selected', async () => {
    const comments: Comment[] = [
      { 
        ...mockComment, 
        id: '1', 
        score: -5, 
        parentId: undefined,
        replies: []
      },
      { 
        ...mockComment, 
        id: '2', 
        score: 3, 
        parentId: undefined,
        replies: []
      },
    ];
    mockCommentService.getComments.mockResolvedValue({ 
      items: comments,
      meta: {
        totalItems: comments.length,
        itemCount: comments.length,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1
      }
    });

    render(<CommentSection postId={postId} />);

    await userEvent.click(screen.getByRole('button', { name: /controversial/i }));

    await waitFor(() => {
      expect(mockCommentList).toHaveBeenCalledWith(
        expect.objectContaining({
          comments: [
            { ...comments[0], replies: [] },
            { ...comments[1], replies: [] },
          ],
        }),
        {}
      );
    });
  });

  it('updates button styles when sorting option changes', async () => {
    render(<CommentSection postId={postId} />);

    const topButton = screen.getByRole('button', { name: /top/i });
    const newButton = screen.getByRole('button', { name: /new/i });

    expect(topButton).toHaveClass('bg-orange-500');
    expect(newButton).not.toHaveClass('bg-orange-500');

    await userEvent.click(newButton);

    expect(topButton).not.toHaveClass('bg-orange-500');
    expect(newButton).toHaveClass('bg-orange-500');
  });

  it('refetches comments when onCommentUpdate is triggered', async () => {
    mockCommentService.getComments.mockResolvedValue({ 
      items: [mockComment],
      meta: {
        totalItems: 1,
        itemCount: 1,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1
      }
    });

    render(<CommentSection postId={postId} />);

    await waitFor(() => {
      expect(mockCommentService.getComments).toHaveBeenCalledTimes(1);
    });

    const commentListProps = mockCommentList.mock.calls[0][0];
    await commentListProps.onCommentUpdate();

    await waitFor(() => {
      expect(mockCommentService.getComments).toHaveBeenCalledTimes(2);
    });
  });
});
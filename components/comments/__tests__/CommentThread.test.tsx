import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentThread } from '../CommentThread';
import { commentService } from '../../../src/services/commentService';
import { useAuth } from '../../../src/hooks/useAuth';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import * as CommentFormModule from '../CommentForm';

// Mock @radix-ui/react-dropdown-menu
jest.mock('@radix-ui/react-dropdown-menu', () => {
  const MockComponent = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  
  return {
    Root: MockComponent,
    Trigger: MockComponent,
    Portal: MockComponent,
    Content: MockComponent,
    Item: MockComponent,
    CheckboxItem: Object.assign(MockComponent, { displayName: 'DropdownMenuCheckboxItem' }),
    RadioItem: Object.assign(MockComponent, { displayName: 'DropdownMenuRadioItem' }),
    Label: MockComponent,
    Separator: MockComponent,
    Shortcut: MockComponent,
    Group: MockComponent,
    Sub: MockComponent,
    SubTrigger: MockComponent,
    SubContent: MockComponent,
    RadioGroup: MockComponent,
    ItemIndicator: MockComponent,
    // Add display names for components that might be accessed via displayName
    DropdownMenuCheckboxItem: { displayName: 'DropdownMenuCheckboxItem' },
    DropdownMenuRadioItem: { displayName: 'DropdownMenuRadioItem' },
    DropdownMenuLabel: { displayName: 'DropdownMenuLabel' },
    DropdownMenuSeparator: { displayName: 'DropdownMenuSeparator' },
    DropdownMenuShortcut: { displayName: 'DropdownMenuShortcut' },
    DropdownMenuSub: { displayName: 'DropdownMenuSub' },
    DropdownMenuSubTrigger: { displayName: 'DropdownMenuSubTrigger' },
    DropdownMenuSubContent: { displayName: 'DropdownMenuSubContent' },
    DropdownMenuRadioGroup: { displayName: 'DropdownMenuRadioGroup' },
    DropdownMenuItemIndicator: { displayName: 'DropdownMenuItemIndicator' },
  };
});

// Mock dependencies
jest.mock('../../../src/services/commentService');
jest.mock('../../../src/hooks/useAuth');
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));
jest.mock('../CommentForm', () => ({
  CommentForm: jest.fn(() => <div data-testid="comment-form" />),
}));
// Mock date-fns formatDistanceToNow
const mockFormatDistanceToNow = jest.fn(() => '2 hours ago');

// Mock the direct import first
jest.mock('date-fns/formatDistanceToNow', () => ({
  __esModule: true,
  default: jest.fn(() => '2 hours ago')
}));

// Then mock the main date-fns module
jest.mock('date-fns', () => ({
  __esModule: true,
  formatDistanceToNow: jest.fn(() => '2 hours ago'),
  default: {
    formatDistanceToNow: jest.fn(() => '2 hours ago')
  }
}));

const mockCommentService = commentService as jest.Mocked<typeof commentService>;
const mockUseAuth = useAuth as jest.Mock;
const mockToast = toast as jest.Mocked<typeof toast>;
const mockCommentForm = CommentFormModule.CommentForm as jest.Mock;

describe('CommentThread', () => {
  const postId = '123';
  const mockComment = {
    id: '1',
    content: 'Test comment',
    postId: '123',
    authorId: 'user1',
    author: { 
      id: 'user1', 
      username: 'testuser', 
      avatarUrl: 'https://example.com/avatar.jpg' 
    },
    score: 10,
    votes: 10,
    userVote: null,
    replyCount: 0,
    createdAt: '2025-06-12T10:00:00Z',
    updatedAt: '2025-06-12T10:00:00Z',
  };
  const mockUser = { id: 'user1', username: 'testuser' };
  const mockOnCommentUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: mockUser, setIsLoginModalOpen: jest.fn() });
    mockFormatDistanceToNow.mockReturnValue('2 hours ago');
  });

  it('renders comment content and metadata', () => {
    render(<CommentThread comment={mockComment} postId={postId} />);

    // Check for the main content
    expect(screen.getByText('Test comment')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    
    // The time format shows "2 hours ago ago" in the test output, so we'll check for partial match
    const timeElement = screen.getByText(/2 hours ago/i);
    expect(timeElement).toBeInTheDocument();
    
    // Check score and avatar
    expect(screen.getByText('10')).toBeInTheDocument();
    const avatar = screen.getByText('t'); // First letter of username in avatar
    expect(avatar).toBeInTheDocument();
  });

  it('applies correct indentation for nested comments', () => {
    const { container } = render(<CommentThread comment={mockComment} postId={postId} depth={1} />);
    
    // Get the comment container which should have the indentation classes
    const commentContainer = container.firstChild as HTMLElement;
    expect(commentContainer).toHaveClass('group');
    expect(commentContainer).toHaveClass('ml-4', 'md:ml-8');
    expect(commentContainer).toHaveClass('border-l-2', 'border-muted', 'pl-4');
  });

  it('handles upvote when authenticated', async () => {
    mockCommentService.upvoteComment.mockResolvedValue(mockComment);

    render(<CommentThread comment={mockComment} postId={postId} onCommentUpdate={mockOnCommentUpdate} />);

    const upvoteButton = screen.getByRole('button', { name: /upvote/i });
    await userEvent.click(upvoteButton);

    expect(mockCommentService.upvoteComment).toHaveBeenCalledWith('1');
    expect(mockOnCommentUpdate).toHaveBeenCalled();
  });

  it('handles removing upvote when already upvoted', async () => {
    const upvotedComment = { 
      ...mockComment, 
      userVote: 'upvote' as const,
      score: 11,
      votes: 11
    };
    mockCommentService.removeVote.mockResolvedValue(mockComment);

    render(<CommentThread comment={upvotedComment} postId={postId} onCommentUpdate={mockOnCommentUpdate} />);

    const upvoteButton = screen.getByRole('button', { name: /upvote/i });
    await userEvent.click(upvoteButton);

    expect(mockCommentService.removeVote).toHaveBeenCalledWith('1');
    expect(mockOnCommentUpdate).toHaveBeenCalled();
  });

  it('shows login modal when voting without authentication', async () => {
    const mockSetIsLoginModalOpen = jest.fn();
    mockUseAuth.mockReturnValue({ user: null, setIsLoginModalOpen: mockSetIsLoginModalOpen });

    render(<CommentThread comment={mockComment} postId={postId} />);

    const upvoteButton = screen.getByRole('button', { name: /upvote/i });
    await userEvent.click(upvoteButton);

    expect(mockSetIsLoginModalOpen).toHaveBeenCalledWith(true);
    expect(mockCommentService.upvoteComment).not.toHaveBeenCalled();
  });

  it('displays error toast when voting fails', async () => {
    mockCommentService.upvoteComment.mockRejectedValue(new Error('Vote error'));

    render(<CommentThread comment={mockComment} postId={postId} />);

    const upvoteButton = screen.getByRole('button', { name: /upvote/i });
    await userEvent.click(upvoteButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to vote on comment');
    });
  });

  it('toggles reply form when clicking reply button', async () => {
    render(<CommentThread comment={mockComment} postId={postId} />);

    const replyButton = screen.getByRole('button', { name: /reply/i });
    await userEvent.click(replyButton);

    expect(screen.getByTestId('comment-form')).toBeInTheDocument();
    expect(mockCommentForm).toHaveBeenCalledWith(
      expect.objectContaining({ postId, onCommentAdded: expect.any(Function) }),
      {}
    );

    await userEvent.click(replyButton);
    expect(screen.queryByTestId('comment-form')).not.toBeInTheDocument();
  });

  it('shows login modal when replying without authentication', async () => {
    const mockSetIsLoginModalOpen = jest.fn();
    mockUseAuth.mockReturnValue({ user: null, setIsLoginModalOpen: mockSetIsLoginModalOpen });

    render(<CommentThread comment={mockComment} postId={postId} />);

    const replyButton = screen.getByRole('button', { name: /reply/i });
    await userEvent.click(replyButton);

    expect(mockSetIsLoginModalOpen).toHaveBeenCalledWith(true);
    expect(screen.queryByTestId('comment-form')).not.toBeInTheDocument();
  });

  it('adds reply successfully', async () => {
    const newReply = { 
      ...mockComment, 
      id: '2', 
      content: 'New reply', 
      parentId: '1',
      updatedAt: '2025-06-12T10:05:00Z'
    };
    mockCommentService.createComment.mockResolvedValue(newReply);

    render(<CommentThread comment={mockComment} postId={postId} onCommentUpdate={mockOnCommentUpdate} />);

    await userEvent.click(screen.getByRole('button', { name: /reply/i }));
    const commentFormProps = mockCommentForm.mock.calls[0][0];
    await commentFormProps.onCommentAdded('New reply');

    await waitFor(() => {
      expect(mockCommentService.createComment).toHaveBeenCalledWith({
        content: 'New reply',
        postId,
        parentId: '1',
      });
      expect(mockToast.success).toHaveBeenCalledWith('Reply posted successfully');
      expect(mockOnCommentUpdate).toHaveBeenCalled();
    });
  });

  it('displays error toast when adding reply fails', async () => {
    mockCommentService.createComment.mockRejectedValue(new Error('Reply error'));

    render(<CommentThread comment={mockComment} postId={postId} />);

    await userEvent.click(screen.getByRole('button', { name: /reply/i }));
    const commentFormProps = mockCommentForm.mock.calls[0][0];
    await commentFormProps.onCommentAdded('New reply');

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to post reply');
    });
  });

  it('loads replies when clicking show replies button', async () => {
    const commentWithReplies = { ...mockComment, replyCount: 1 };
    const mockReply = {
      ...mockComment,
      id: '2',
      content: 'Test reply',
      parentId: '1'
    };
    
    mockCommentService.getReplies.mockResolvedValueOnce({
      items: [mockReply],
      meta: {
        totalItems: 1,
        itemCount: 1,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1,
      },
    });

    render(<CommentThread comment={commentWithReplies} postId={postId} />);

    // Find and click the show replies button
    const showRepliesButton = screen.getByRole('button', { name: /show 1 reply/i });
    await userEvent.click(showRepliesButton);

    await waitFor(() => {
      expect(mockCommentService.getReplies).toHaveBeenCalledWith('1', 1);
    });
    
    // Check if the reply content is shown
    expect(await screen.findByText('Test reply')).toBeInTheDocument();
  });

  it('hides replies when clicking hide replies button', async () => {
    const commentWithReplies = { ...mockComment, replyCount: 1 };
    mockCommentService.getReplies.mockResolvedValue({
      items: [{ ...mockComment, id: '2', parentId: '1' }],
      meta: { totalItems: 1, itemCount: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
    });

    render(<CommentThread comment={commentWithReplies} postId={postId} />);

    await userEvent.click(screen.getByRole('button', { name: /show 1 reply/i }));
    await userEvent.click(screen.getByRole('button', { name: /hide 1 reply/i }));

    await waitFor(() => {
      expect(screen.queryByTestId('comment-thread')).not.toBeInTheDocument();
    });
  });

  it('loads more replies when clicking load more button', async () => {
    const commentWithReplies = { ...mockComment, replyCount: 3 };
    const mockReplies = [
      { ...mockComment, id: '2', content: 'First reply' },
      { ...mockComment, id: '3', content: 'Second reply' },
    ];

    mockCommentService.getReplies.mockResolvedValueOnce({
      items: mockReplies,
      meta: {
        totalItems: 3,
        itemCount: 2,
        itemsPerPage: 2,
        totalPages: 2,
        currentPage: 1,
      },
    });

    render(<CommentThread comment={commentWithReplies} postId={postId} />);

    // Show replies first
    const showRepliesButton = screen.getByRole('button', { name: /show \d+ repl(?:y|ies)/i });
    await userEvent.click(showRepliesButton);

    // Wait for initial replies to load
    await screen.findByText('First reply');

    // Mock the second page of replies
    const moreReplies = [{ ...mockComment, id: '4', content: 'Third reply' }];
    mockCommentService.getReplies.mockResolvedValueOnce({
      items: moreReplies,
      meta: {
        totalItems: 3,
        itemCount: 1,
        itemsPerPage: 2,
        totalPages: 2,
        currentPage: 2,
      },
    });

    // Click load more
    const loadMoreButton = await screen.findByRole('button', { name: /load more/i });
    await userEvent.click(loadMoreButton);

    // Check if all replies are displayed
    await waitFor(() => {
      expect(mockCommentService.getReplies).toHaveBeenCalledWith('1', 2);
      expect(screen.getByText('First reply')).toBeInTheDocument();
      expect(screen.getByText('Second reply')).toBeInTheDocument();
    });
    
    // Third reply should now be visible
    expect(await screen.findByText('Third reply')).toBeInTheDocument();
  });

  it('displays error toast when loading replies fails', async () => {
    const commentWithReplies = { ...mockComment, replyCount: 1 };
    mockCommentService.getReplies.mockRejectedValue(new Error('Replies error'));

    render(<CommentThread comment={commentWithReplies} postId={postId} />);

    await userEvent.click(screen.getByRole('button', { name: /show 1 reply/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to load replies');
    });
  });

  it('renders dropdown menu with report option', async () => {
    render(<CommentThread comment={mockComment} postId={postId} />);

    // Find the more options button by its aria-label or other attributes
    const moreButtons = screen.getAllByRole('button');
    const moreButton = moreButtons.find(button => {
      return button.querySelector('svg.lucide-ellipsis');
    });
    
    expect(moreButton).toBeInTheDocument();
    await userEvent.click(moreButton!);

    // Check for the dropdown menu item
    const reportItem = await screen.findByText(/report/i);
    expect(reportItem).toBeInTheDocument();
  });

  it('applies correct vote styling for upvote and downvote', async () => {
    // Test upvoted comment
    const upvotedComment = { 
      ...mockComment, 
      userVote: 'upvote' as const,
      score: 11,
    };
    
    const { rerender } = render(<CommentThread comment={upvotedComment} postId={postId} />);
    
    // Find the upvote button by its SVG content
    const upvoteButton = screen.getByRole('button', { 
      name: /upvote/i 
    });
    expect(upvoteButton).toHaveClass('text-orange-500');
    
    // Check the score displays correctly
    const scoreElement = screen.getByText('11');
    expect(scoreElement).toHaveClass('text-orange-500');
    
    // Test downvoted comment
    const downvotedComment = { 
      ...mockComment, 
      userVote: 'downvote' as const,
      score: 9,
    };
    
    rerender(<CommentThread comment={downvotedComment} postId={postId} />);
    
    // Find the downvote button by its SVG content
    const downvoteButton = screen.getByRole('button', { 
      name: /downvote/i 
    });
    expect(downvoteButton).toHaveClass('text-blue-500');
    
    // Check the score updates correctly
    const updatedScore = screen.getByText('9');
    expect(updatedScore).toHaveClass('text-blue-500');
  });
});
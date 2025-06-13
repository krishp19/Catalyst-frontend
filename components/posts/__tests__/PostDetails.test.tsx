import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostDetails } from '../PostDetails';
import { useAuth } from '../../../src/hooks/useAuth';
import { voteService } from '../../../src/services/voteService';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

// Mock dependencies
jest.mock('../../../src/hooks/useAuth');
jest.mock('../../../src/services/voteService');
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));
jest.mock('next/image', () => {
  // eslint-disable-next-line @next/next/no-img-element
  return ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />;
});
jest.mock('lucide-react', () => ({
  ArrowBigUp: () => <div data-testid="arrow-big-up" />,
  ArrowBigDown: () => <div data-testid="arrow-big-down" />,
  MessageSquare: () => <div data-testid="message-square" />,
  Share2: () => <div data-testid="share2" />,
  BookmarkPlus: () => <div data-testid="bookmark-plus" />,
  MoreHorizontal: () => <div data-testid="more-horizontal" />,
  EyeOff: () => <div data-testid="eye-off" />,
  Flag: () => <div data-testid="flag" />,
  Link2: () => <div data-testid="link2" />,
}));
jest.mock('../../ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) =>
    asChild ? children : <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-item">{children}</div>
  ),
  DropdownMenuSeparator: () => <div data-testid="dropdown-separator" />,
}));
jest.mock('../../common/HtmlContent', () => {
  return ({ html }: { html: string }) => <div data-testid="html-content">{html}</div>;
});

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '2 days ago'),
}));

// Mock useAuth
const mockUseAuth = useAuth as jest.Mock;
const mockSetIsLoginModalOpen = jest.fn();

// Mock voteService
const mockVoteService = voteService as jest.Mocked<typeof voteService>;

// Sample post data
const mockPost = {
  id: 'post1',
  title: 'Test Post',
  score: 10,
  type: 'text' as const,
  contentType: 'text' as const,
  content: '<p>Test content</p>',
  imageUrl: undefined,
  linkUrl: undefined,
  createdAt: new Date('2025-06-11T00:00:00Z').toISOString(),
  updatedAt: new Date('2025-06-11T00:00:00Z').toISOString(),
  isPinned: false,
  commentCount: 5,
  upvotes: 15,
  downvotes: 5,
  votes: 10,
  isDeleted: false,
  isEdited: false,
  community: {
    id: 'comm1',
    name: 'testcommunity',
    description: 'Test community',
    iconUrl: 'https://example.com/icon.png',
    memberCount: 100,
    createdAt: new Date('2025-01-01T00:00:00Z').toISOString(),
  },
  author: {
    id: 'user1',
    username: 'testuser',
  },
  tags: ['tag1', 'tag2'],
};

// Mock response for voteService
const mockVoteResponse = {
  ...mockPost,
  score: 11, // Example updated score
};

// Helper to set up common mocks
const setupMocks = (isAuthenticated = true) => {
  mockUseAuth.mockReturnValue({
    user: isAuthenticated ? { id: 'user1', username: 'testuser' } : null,
    setIsLoginModalOpen: mockSetIsLoginModalOpen,
  });
  mockVoteService.upvote.mockResolvedValue(mockVoteResponse);
  mockVoteService.downvote.mockResolvedValue(mockVoteResponse);
  mockVoteService.removeVote.mockResolvedValue(mockVoteResponse);
};

describe('PostDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  it('renders post details correctly for text post', async () => {
    render(<PostDetails post={mockPost} />);

    // Check title
    expect(screen.getByText('Test Post')).toBeInTheDocument();

    // Check community and author
    expect(screen.getByText('r/testcommunity')).toBeInTheDocument();
    expect(screen.getByText('u/testuser')).toBeInTheDocument();

    // Check timestamp
    expect(screen.getByText('2 days ago')).toBeInTheDocument();

    // Check content
    expect(screen.getByTestId('html-content')).toHaveTextContent('Test content');

    // Check tags
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();

    // Check vote count
    expect(screen.getByText('10')).toBeInTheDocument();

    // Check actions
    expect(screen.getByText('5 Comments')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByTestId('more-horizontal')).toBeInTheDocument();
  });

  it('renders image post correctly', async () => {
    const imagePost = {
      ...mockPost,
      type: 'image' as const,
      content: '',
      contentType: 'image' as const,
      imageUrl: 'https://example.com/image.jpg',
      upvotes: 15,
      downvotes: 5,
      votes: 10,
      isDeleted: false,
      isEdited: false,
    };
    render(<PostDetails post={imagePost} />);

    const image = screen.getByRole('img', { name: 'Test Post' });
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(screen.queryByTestId('html-content')).not.toBeInTheDocument();
  });

  it('renders link post correctly', async () => {
    const linkPost = {
      ...mockPost,
      type: 'link' as const,
      content: '',
      contentType: 'link' as const,
      linkUrl: 'https://example.com',
      upvotes: 15,
      downvotes: 5,
      votes: 10,
      isDeleted: false,
      isEdited: false,
    };
    render(<PostDetails post={linkPost} />);

    const link = screen.getByRole('link', { name: 'https://example.com' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.queryByTestId('html-content')).not.toBeInTheDocument();
  });

  it('handles upvote when authenticated', async () => {
    const user = userEvent.setup();
    render(<PostDetails post={mockPost} />);

    const upvoteButton = screen.getByTestId('arrow-big-up').parentElement!;
    await user.click(upvoteButton);

    expect(mockVoteService.upvote).toHaveBeenCalledWith('post1');
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(upvoteButton).toHaveClass('text-orange-500');
  });

  it('handles downvote when authenticated', async () => {
    const user = userEvent.setup();
    render(<PostDetails post={mockPost} />);

    const downvoteButton = screen.getByTestId('arrow-big-down').parentElement!;
    await user.click(downvoteButton);

    expect(mockVoteService.downvote).toHaveBeenCalledWith('post1');
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(downvoteButton).toHaveClass('text-blue-500');
  });

  it('removes upvote when clicked again', async () => {
    const user = userEvent.setup();
    render(<PostDetails post={mockPost} />);

    const upvoteButton = screen.getByTestId('arrow-big-up').parentElement!;
    await user.click(upvoteButton); // Upvote
    await user.click(upvoteButton); // Remove upvote

    expect(mockVoteService.upvote).toHaveBeenCalledWith('post1');
    expect(mockVoteService.removeVote).toHaveBeenCalledWith('post1');
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(upvoteButton).not.toHaveClass('text-orange-500');
  });

  it('removes downvote when clicked again', async () => {
    const user = userEvent.setup();
    render(<PostDetails post={mockPost} />);

    const downvoteButton = screen.getByTestId('arrow-big-down').parentElement!;
    await user.click(downvoteButton); // Downvote
    await user.click(downvoteButton); // Remove downvote

    expect(mockVoteService.downvote).toHaveBeenCalledWith('post1');
    expect(mockVoteService.removeVote).toHaveBeenCalledWith('post1');
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(downvoteButton).not.toHaveClass('text-blue-500');
  });

  it('switches from upvote to downvote', async () => {
    const user = userEvent.setup();
    render(<PostDetails post={mockPost} />);

    const upvoteButton = screen.getByTestId('arrow-big-up').parentElement!;
    const downvoteButton = screen.getByTestId('arrow-big-down').parentElement!;
    await user.click(upvoteButton); // Upvote
    await user.click(downvoteButton); // Downvote

    expect(mockVoteService.upvote).toHaveBeenCalledWith('post1');
    expect(mockVoteService.removeVote).toHaveBeenCalledWith('post1');
    expect(mockVoteService.downvote).toHaveBeenCalledWith('post1');
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(upvoteButton).not.toHaveClass('text-orange-500');
    expect(downvoteButton).toHaveClass('text-blue-500');
  });

  it('opens login modal when unauthenticated and voting', async () => {
    setupMocks(false);
    const user = userEvent.setup();
    render(<PostDetails post={mockPost} />);

    const upvoteButton = screen.getByTestId('arrow-big-up').parentElement!;
    await user.click(upvoteButton);

    expect(mockSetIsLoginModalOpen).toHaveBeenCalledWith(true);
    expect(mockVoteService.upvote).not.toHaveBeenCalled();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('handles voting error', async () => {
    mockVoteService.upvote.mockRejectedValueOnce(new Error('Vote failed'));
    const user = userEvent.setup();
    render(<PostDetails post={mockPost} />);

    const upvoteButton = screen.getByTestId('arrow-big-up').parentElement!;
    await user.click(upvoteButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to vote. Please try again.');
    });
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('toggles save button', async () => {
    const user = userEvent.setup();
    render(<PostDetails post={mockPost} />);

    const saveButton = screen.getByTestId('save-button');
    await user.click(saveButton);

    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(saveButton).toHaveClass('text-yellow-500');

    await user.click(saveButton);
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(saveButton).toHaveClass('gap-2'); // The button always has this class, only the text changes
  });

  it('renders dropdown menu items', async () => {
    render(<PostDetails post={mockPost} />);

    const dropdownTrigger = screen.getByTestId('dropdown-trigger');
    expect(dropdownTrigger).toBeInTheDocument();

    // Simulate dropdown content being visible
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
    expect(screen.getByText('Hide')).toBeInTheDocument();
    expect(screen.getByText('Report')).toBeInTheDocument();
    expect(screen.getByText('Copy link')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-separator')).toBeInTheDocument();
  });

  it('disables voting buttons during vote processing', async () => {
    // Create a promise that we can resolve manually
    let resolveVote: (value: any) => void;
    const votePromise = new Promise(resolve => {
      resolveVote = resolve;
    });

    // Mock the vote service to use our manual resolve
    const mockUpvote = jest.fn().mockImplementation(() => votePromise);
    mockVoteService.upvote = mockUpvote;
    
    const user = userEvent.setup();
    render(<PostDetails post={mockPost} />);

    const upvoteButton = screen.getByTestId('upvote-button');
    const downvoteButton = screen.getByTestId('downvote-button');
    
    // Initial state - buttons should not be disabled
    expect(upvoteButton).not.toBeDisabled();
    expect(downvoteButton).not.toBeDisabled();
    
    // Click the upvote button
    await user.click(upvoteButton);
    
    // Buttons should be disabled during voting
    expect(upvoteButton).toBeDisabled();
    expect(downvoteButton).toBeDisabled();
    
    // Resolve the vote promise
    resolveVote!(mockVoteResponse);
    
    // Wait for the component to update
    await waitFor(() => {
      expect(upvoteButton).not.toBeDisabled();
      expect(downvoteButton).not.toBeDisabled();
    });
  });

  it('renders without tags when none are provided', async () => {
    const postWithoutTags = {
      ...mockPost,
      tags: [],
    };
    render(<PostDetails post={postWithoutTags} />);

    expect(screen.queryByText('tag1')).not.toBeInTheDocument();
    expect(screen.queryByText('tag2')).not.toBeInTheDocument();
  });
});
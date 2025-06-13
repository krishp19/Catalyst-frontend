import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MorePosts } from '../MorePosts';
import { postService } from '../../../src/services/postService';
import { voteService } from '../../../src/services/voteService';
import { useAuth } from '../../../src/hooks/useAuth';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('../../../src/services/postService');
jest.mock('../../../src/services/voteService');
jest.mock('../../../src/hooks/useAuth');
jest.mock('sonner');
jest.mock('../PostCard', () => ({
  PostCard: ({ post, onVote, onRemoveVote, isVoting }: any) => (
    <div data-testid="post-card">
      <p>{post.title}</p>
      <button onClick={() => onVote(post.id, 'upvote')} data-testid={`upvote-${post.id}`}>
        Upvote
      </button>
      <button onClick={() => onVote(post.id, 'downvote')} data-testid={`downvote-${post.id}`}>
        Downvote
      </button>
      <button onClick={() => onRemoveVote(post.id)} data-testid={`remove-vote-${post.id}`}>
        Remove Vote
      </button>
      {isVoting && <span data-testid="voting-indicator">Voting...</span>}
    </div>
  ),
}));
jest.mock('../../ui/button', () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));
jest.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader">Loading...</div>,
}));

// Mock useAuth hook
const mockUseAuth = useAuth as jest.Mock;
const mockSetIsLoginModalOpen = jest.fn();

// Mock toast
const mockToastError = jest.fn();
(toast.error as jest.Mock).mockImplementation(mockToastError);

// Sample post data
const mockPosts = [
  {
    id: '1',
    title: 'Post 1',
    content: 'Content 1',
    author: { id: 'a1', username: 'user1', avatarUrl: 'avatar1.png' },
    community: {
      id: 'c1',
      name: 'Community 1',
      description: 'Desc 1',
      iconUrl: 'icon1.png',
      memberCount: 100,
      createdAt: '2023-01-01',
    },
    createdAt: '2023-01-01',
    score: 10,
    commentCount: 5,
    isPinned: false,
    tags: ['tag1'],
    userVote: null,
  },
  {
    id: '2',
    title: 'Post 2',
    content: 'Content 2',
    author: { id: 'a2', username: 'user2', avatarUrl: 'avatar2.png' },
    community: {
      id: 'c2',
      name: 'Community 2',
      description: 'Desc 2',
      iconUrl: 'icon2.png',
      memberCount: 200,
      createdAt: '2023-02-01',
    },
    createdAt: '2023-02-01',
    score: 20,
    commentCount: 10,
    isPinned: true,
    tags: ['tag2'],
    userVote: 'up',
  },
];

// Mock postService response
const mockPostServiceResponse = {
  items: mockPosts.map((post) => ({
    ...post,
    author: { ...post.author, avatar: post.author.avatarUrl },
    community: { ...post.community, icon: post.community.iconUrl, members: post.community.memberCount },
    votes: post.score,
  })),
  meta: { currentPage: 1, totalPages: 2 },
};

describe('MorePosts Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: null, setIsLoginModalOpen: mockSetIsLoginModalOpen });
    (postService.getPosts as jest.Mock).mockResolvedValue(mockPostServiceResponse);
  });

  it('renders loading state initially', async () => {
    render(<MorePosts />);
    expect(screen.getByTestId('loader')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });
  });

  it('renders posts after loading', async () => {
    render(<MorePosts />);
    await waitFor(() => {
      expect(screen.getAllByTestId('post-card')).toHaveLength(2);
      expect(screen.getByText('Post 1')).toBeInTheDocument();
      expect(screen.getByText('Post 2')).toBeInTheDocument();
    });
  });

  it('renders error message on fetch failure', async () => {
    (postService.getPosts as jest.Mock).mockRejectedValue(new Error('Fetch error'));
    render(<MorePosts />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load more posts')).toBeInTheDocument();
    });
  });

  it('renders nothing when no posts are returned', async () => {
    (postService.getPosts as jest.Mock).mockResolvedValue({ items: [], meta: { currentPage: 1, totalPages: 1 } });
    render(<MorePosts />);
    await waitFor(() => {
      expect(screen.queryByTestId('post-card')).not.toBeInTheDocument();
      expect(screen.queryByText('Load More')).not.toBeInTheDocument();
    });
  });

  it('filters out excluded post', async () => {
    render(<MorePosts excludePostId="1" />);
    await waitFor(() => {
      expect(screen.getAllByTestId('post-card')).toHaveLength(1);
      expect(screen.getByText('Post 2')).toBeInTheDocument();
      expect(screen.queryByText('Post 1')).not.toBeInTheDocument();
    });
  });

  it('renders community-specific title when communityId is provided', async () => {
    render(<MorePosts communityId="c1" />);
    await waitFor(() => {
      expect(screen.getByText('More from this community')).toBeInTheDocument();
    });
  });

  it('renders "Explore All Communities" title when no communityId is provided', async () => {
    render(<MorePosts />);
    await waitFor(() => {
      expect(screen.getByText('Explore All Communities')).toBeInTheDocument();
    });
  });

  it('handles load more button click', async () => {
    render(<MorePosts />);
    await waitFor(() => {
      expect(screen.getByText('Load More')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Load More'));
    expect(postService.getPosts).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, limit: 5, sort: 'new' })
    );
  });

  it('disables load more button when loading', async () => {
    // First resolve the initial load
    (postService.getPosts as jest.Mock).mockResolvedValueOnce(mockPostServiceResponse);
    
    render(<MorePosts />);
    
    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByText('Load More')).toBeInTheDocument();
    });
    
    // Setup the mock to never resolve for the next call
    (postService.getPosts as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves to simulate loading
    );
    
    // Click load more
    const loadMoreButton = screen.getByText('Load More');
    fireEvent.click(loadMoreButton);
    
    // Check if button is disabled during loading
    expect(loadMoreButton).toBeDisabled();
  });

  it('hides load more button when no more posts are available', async () => {
    (postService.getPosts as jest.Mock).mockResolvedValue({
      items: mockPosts,
      meta: { currentPage: 1, totalPages: 1 },
    });
    render(<MorePosts />);
    await waitFor(() => {
      expect(screen.queryByText('Load More')).not.toBeInTheDocument();
    });
  });

  it('opens login modal when voting without user', async () => {
    render(<MorePosts />);
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('upvote-1'));
    });
    expect(mockSetIsLoginModalOpen).toHaveBeenCalledWith(true);
    expect(voteService.upvote).not.toHaveBeenCalled();
  });

  it('handles upvote successfully', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, setIsLoginModalOpen: mockSetIsLoginModalOpen });
    (voteService.upvote as jest.Mock).mockResolvedValue({ score: 11 });
    
    render(<MorePosts />);
    
    // Wait for posts to load
    await waitFor(() => {
      expect(screen.getByText('Post 1')).toBeInTheDocument();
    });
    
    // Click upvote
    fireEvent.click(screen.getByTestId('upvote-1'));
    
    await waitFor(() => {
      expect(voteService.upvote).toHaveBeenCalledWith('1');
    });
  });
  
  it('handles downvote successfully', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, setIsLoginModalOpen: mockSetIsLoginModalOpen });
    (voteService.downvote as jest.Mock).mockResolvedValue({ score: 9 });
    
    render(<MorePosts />);
    
    // Wait for posts to load
    await waitFor(() => {
      expect(screen.getByText('Post 1')).toBeInTheDocument();
    });
    
    // Click downvote
    fireEvent.click(screen.getByTestId('downvote-1'));
    
    await waitFor(() => {
      expect(voteService.downvote).toHaveBeenCalledWith('1');
    });
  });
  
  it('handles vote removal successfully', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, setIsLoginModalOpen: mockSetIsLoginModalOpen });
    (voteService.removeVote as jest.Mock).mockResolvedValue({ score: 10 });
    render(<MorePosts />);
    
    // Wait for posts to load
    await waitFor(() => {
      expect(screen.getByText('Post 1')).toBeInTheDocument();
    });
    
    // Click remove vote
    fireEvent.click(screen.getByTestId('remove-vote-1'));
    
    await waitFor(() => {
      expect(voteService.removeVote).toHaveBeenCalledWith('1');
    });
  });

  it('shows toast error on vote failure', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, setIsLoginModalOpen: mockSetIsLoginModalOpen });
    (voteService.upvote as jest.Mock).mockRejectedValue(new Error('Vote error'));
    render(<MorePosts />);
    
    // Wait for posts to load
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('upvote-1'));
    });
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Failed to submit vote. Please try again.');
    });
  });

  it('shows toast error on vote removal failure', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' }, setIsLoginModalOpen: mockSetIsLoginModalOpen });
    (voteService.removeVote as jest.Mock).mockRejectedValue(new Error('Remove vote error'));
    render(<MorePosts />);
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('remove-vote-1'));
    });
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Failed to remove vote. Please try again.');
    });
  });
});
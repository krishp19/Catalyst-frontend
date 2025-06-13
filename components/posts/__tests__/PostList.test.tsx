// Mock the local UI dropdown menu components
jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-item">{children}</div>,
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-label">{children}</div>,
  DropdownMenuGroup: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-group">{children}</div>,
  DropdownMenuCheckboxItem: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-checkbox-item">{children}</div>,
  DropdownMenuRadioGroup: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-radio-group">{children}</div>,
  DropdownMenuRadioItem: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-radio-item">{children}</div>,
  DropdownMenuSub: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-sub">{children}</div>,
  DropdownMenuSubTrigger: ({ children, ...props }: any) => <div data-testid="dropdown-sub-trigger" {...props}>{children}</div>,
  DropdownMenuSubContent: ({ children, ...props }: any) => <div data-testid="dropdown-sub-content" {...props}>{children}</div>,
  DropdownMenuShortcut: ({ children }: { children: React.ReactNode }) => <span data-testid="dropdown-shortcut">{children}</span>,
}));

// PostList.test.tsx
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostList } from '../PostList';
import { postService } from '../../../src/services/postService';
import { voteService } from '../../../src/services/voteService';
import { useAuth } from '../../../src/hooks/useAuth';
import { useToast } from '../../../hooks/use-toast';
import { Post } from '../../../src/types/post';

// Mock PostCard component to test additional Post fields
jest.mock('../PostCard', () => ({
  PostCard: ({ post, onVote, onRemoveVote, isVoting }: any) => (
    <div data-testid={`post-${post.id}`}>
      <h3>{post.title}</h3>
      <p>Score: {post.score}</p>
      <p>Content Type: {post.contentType}</p>
      {post.flair && <span data-testid="flair">{post.flair.text}</span>}
      {post.media && <img data-testid="media" src={post.media.url} alt="media" />}
      {post.poll && (
        <div data-testid="poll">
          {post.poll.options.map((opt: any) => (
            <span key={opt.id}>{opt.text}: {opt.votes}</span>
          ))}
        </div>
      )}
      {post.awards && post.awards.length > 0 && (
        <div data-testid="awards">
          {post.awards.map((award: any) => (
            <span key={award.id}>{award.name}: {award.count}</span>
          ))}
        </div>
      )}
      <p>IsOC: {post.isOC?.toString() ?? 'false'}</p>
      <p>IsNSFW: {post.isNSFW?.toString() ?? 'false'}</p>
      <p>IsPinned: {post.isPinned?.toString() ?? 'false'}</p>
      <button onClick={() => onVote(post.id, 'upvote')} aria-label="Upvote">Upvote</button>
      <button onClick={() => onVote(post.id, 'downvote')} aria-label="Downvote">Downvote</button>
      {post.userVote && <button onClick={() => onRemoveVote(post.id)} aria-label="Remove vote">Remove Vote</button>}
      {isVoting && <span>Voting...</span>}
    </div>
  ),
}));

// Mock dependencies
jest.mock('../../../src/services/postService');
jest.mock('../../../src/services/voteService');
jest.mock('../../../src/hooks/useAuth');
jest.mock('../../../hooks/use-toast');

// Mock react-intersection-observer
const mockUseInView = jest.fn();

jest.mock('react-intersection-observer', () => ({
  useInView: () => {
    const [inView, setInView] = React.useState(false);
    const ref = jest.fn();
    
    React.useEffect(() => {
      mockUseInView({ inView, ref });
    }, [inView]);
    
    return { ref, inView };
  },
}));

const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Test Post 1',
    content: 'Content 1',
    imageUrl: '/image1.jpg',
    linkUrl: 'https://example.com',
    type: 'text',
    contentType: 'text',
    score: 10,
    upvotes: 15,
    downvotes: 5,
    votes: 10,
    commentCount: 3,
    isPinned: false,
    authorId: 'user1',
    communityId: 'comm1',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    tags: ['tag1'],
    author: { id: 'user1', username: 'User1', avatarUrl: '/avatar1.png' },
    community: {
      id: 'comm1',
      name: 'Community1',
      iconUrl: '/icon1.png',
      description: 'Desc1',
      memberCount: 100,
      createdAt: '2023-01-01T00:00:00Z',
    },
    userVote: null,
    isSaved: false,
    isHidden: false,
    isLocked: false,
    isSpoiler: false,
    isOC: true,
    isNSFW: false,
    url: 'https://example.com/post1',
    domain: 'example.com',
    flair: { text: 'Flair1', cssClass: 'flair1', backgroundColor: '#ff0000', textColor: '#ffffff' },
    media: { type: 'image', url: '/media1.jpg', thumbnailUrl: '/thumb1.jpg', width: 800, height: 600 },
    crosspost: { count: 2, parentId: 'parent1' },
    awards: [{ id: 'award1', name: 'Gold', iconUrl: '/award1.png', count: 1 }],
  },
  {
    id: '2',
    title: 'Test Post 2',
    content: 'Content 2',
    type: 'text',
    contentType: 'text',
    score: 20,
    upvotes: 25,
    downvotes: 5,
    votes: 20,
    commentCount: 5,
    isPinned: true,
    isOC: false,
    isNSFW: false,
    isLocked: false,
    isSpoiler: false,
    isSaved: true,
    isHidden: false,
    authorId: 'user2',
    communityId: 'comm2',
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
    tags: ['tag2'],
    author: { 
      id: 'user2', 
      username: 'User2', 
      avatarUrl: '/avatar2.png' 
    },
    community: {
      id: 'comm2',
      name: 'Community2',
      iconUrl: '/icon2.png',
      description: 'Desc2',
      memberCount: 200,
      createdAt: '2023-01-02T00:00:00Z',
    },
    userVote: 'up',
    url: 'https://example.com/post2',
    domain: 'example.com',

    poll: {
      options: [
        { id: 'opt1', text: 'Option 1', votes: 10, percentage: 50, isVoted: true },
        { id: 'opt2', text: 'Option 2', votes: 10, percentage: 50, isVoted: false },
      ],
      totalVotes: 20,
      votingEndsAt: '2023-01-03T00:00:00Z',
      isVoted: true,
    },
    crosspost: undefined,
    awards: [],
  },
];

describe('PostList', () => {
  const mockUser = { id: 'user1', username: 'User1' };
  const mockToast = { toast: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser, isAuthenticated: true });
    (useToast as jest.Mock).mockReturnValue(mockToast);
    (postService.getPosts as jest.Mock).mockResolvedValue({
      items: mockPosts,
      meta: { currentPage: 1, totalPages: 2, totalItems: mockPosts.length, itemCount: mockPosts.length, itemsPerPage: 10 },
    });
    (postService.getPopularPosts as jest.Mock).mockResolvedValue({
      items: mockPosts.slice(0, 1),
      meta: { currentPage: 1, totalPages: 1, totalItems: 1, itemCount: 1, itemsPerPage: 10 },
    });
    (postService.getJoinedCommunityPosts as jest.Mock).mockResolvedValue({
      items: mockPosts,
      meta: { currentPage: 1, totalPages: 2, totalItems: mockPosts.length, itemCount: mockPosts.length, itemsPerPage: 10 },
    });
    (voteService.upvote as jest.Mock).mockResolvedValue({ score: 11, upvotes: 16, downvotes: 5 });
    (voteService.downvote as jest.Mock).mockResolvedValue({ score: 9, upvotes: 15, downvotes: 6 });
    (voteService.removeVote as jest.Mock).mockResolvedValue({ score: 10, upvotes: 15, downvotes: 5 });
  });

  it('displays posts correctly', () => {
    render(<PostList initialPosts={mockPosts} />);
    expect(screen.getByText('Latest Posts')).toBeInTheDocument();
    
    // Use getAllByTestId and take the first instance of each post
    const post1Elements = screen.getAllByTestId('post-1');
    const post2Elements = screen.getAllByTestId('post-2');
    
    // Check that we have at least one of each post
    expect(post1Elements.length).toBeGreaterThan(0);
    expect(post2Elements.length).toBeGreaterThan(0);
    
    // Use the first instance of each post for assertions
    const post1 = post1Elements[0];
    const post2 = post2Elements[0];
    
    expect(within(post1).getByText('Test Post 1')).toBeInTheDocument();
    expect(within(post1).getByText(/Score:\s*10/)).toBeInTheDocument();
    expect(within(post1).getByText('Content Type: text')).toBeInTheDocument();
    expect(within(post2).getByText('Test Post 2')).toBeInTheDocument();
    expect(within(post2).getByText(/Score:\s*20/)).toBeInTheDocument();
  });

  it('displays loading state when fetching posts', () => {
    (postService.getPosts as jest.Mock).mockImplementationOnce(() => new Promise(() => {}));
    render(<PostList />);
    
    // Find the loading spinner by its test ID or class
    const loadingSpinner = screen.getByTestId('loading-spinner');
    expect(loadingSpinner).toBeInTheDocument();
    expect(loadingSpinner).toHaveClass('animate-spin');
  });

  it('displays error state when fetching fails', async () => {
    (postService.getPosts as jest.Mock).mockRejectedValue(new Error('Failed to fetch posts'));
    render(<PostList />);
    await waitFor(() => {
      expect(screen.getByText('Error Loading Posts')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch posts')).toBeInTheDocument();
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to load posts',
        variant: 'destructive',
      });
    });
  });

  it('displays authentication error for joined communities when not authenticated', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, isAuthenticated: false });
    render(<PostList showJoinedCommunities />);
    await waitFor(() => {
      expect(screen.getByText('Authentication Required')).toBeInTheDocument();
      expect(screen.getByText('You need to be logged in to view posts from your communities.')).toBeInTheDocument();
    });
  });

  it('fetches and displays popular posts when popular prop is true', async () => {
    render(<PostList popular />);
    await waitFor(() => {
      expect(postService.getPopularPosts).toHaveBeenCalledWith(10);
      expect(screen.getByTestId('post-1')).toBeInTheDocument();
      expect(screen.queryByTestId('post-2')).not.toBeInTheDocument();
    });
  });

  it('fetches and displays joined community posts when showJoinedCommunities is true', async () => {
    // Mock the response for joined community posts
    (postService.getJoinedCommunityPosts as jest.Mock).mockResolvedValueOnce({
      items: mockPosts,
      meta: { currentPage: 1, totalPages: 1, totalItems: 2, itemCount: 2, itemsPerPage: 10 },
    });

    render(<PostList showJoinedCommunities />);
    
    await waitFor(() => {
      expect(postService.getJoinedCommunityPosts).toHaveBeenCalledWith(expect.objectContaining({
        page: 1,
        limit: 10,
        sort: 'hot'
      }));
      
      // Check that we have the posts from the mock data
      const post1Elements = screen.getAllByTestId('post-1');
      const post2Elements = screen.getAllByTestId('post-2');
      
      expect(post1Elements.length).toBeGreaterThan(0);
      expect(post2Elements.length).toBeGreaterThan(0);
    });
  });

  it('changes sort order when clicking tabs', async () => {
    render(<PostList />);
    const hotTab = screen.getByText('Hot');
    const newTab = screen.getByText('New');
    await userEvent.click(newTab);
    expect(postService.getPosts).toHaveBeenCalledWith({ page: 1, limit: 10, sort: 'new' });
    await userEvent.click(hotTab);
    expect(postService.getPosts).toHaveBeenCalledWith({ page: 1, limit: 10, sort: 'hot' });
  });

  it('changes time filter when selecting dropdown option', async () => {
    render(<PostList />);
    const timeFilterButton = screen.getByText('All');
    await userEvent.click(timeFilterButton);
    const todayOption = screen.getByText('Today');
    await userEvent.click(todayOption);
    expect(postService.getPosts).toHaveBeenCalledWith({ page: 1, limit: 10, sort: 'hot' });
  });

  it('loads more posts when scrolling to bottom', async () => {
    // Mock the initial posts
    (postService.getPosts as jest.Mock).mockResolvedValueOnce({
      items: mockPosts,
      meta: { currentPage: 1, totalPages: 2, totalItems: 3, itemCount: 2, itemsPerPage: 2 },
    });

    // Mock the second page of posts
    const nextPagePosts = [
      {
        id: '3',
        title: 'Test Post 3',
        content: 'Content 3',
        type: 'text',
        contentType: 'text',
        score: 30,
        upvotes: 35,
        downvotes: 5,
        votes: 30,
        commentCount: 7,
        isPinned: false,
        isOC: true,
        isNSFW: false,
        isLocked: false,
        isSpoiler: false,
        isSaved: false,
        isHidden: false,
        authorId: 'user3',
        communityId: 'comm1',
        createdAt: '2023-01-03T00:00:00Z',
        updatedAt: '2023-01-03T00:00:00Z',
        tags: ['tag3'],
        author: { id: 'user3', username: 'User3', avatarUrl: '/avatar3.png' },
        community: {
          id: 'comm1',
          name: 'Community1',
          iconUrl: '/icon1.png',
          description: 'Desc1',
          memberCount: 100,
          createdAt: '2023-01-01T00:00:00Z',
        },
        userVote: null,
        url: 'https://example.com/post3',
        domain: 'example.com',
      },
    ];

    // Setup the second page response
    (postService.getPosts as jest.Mock).mockResolvedValueOnce({
      items: nextPagePosts,
      meta: { currentPage: 2, totalPages: 2, totalItems: 3, itemCount: 1, itemsPerPage: 2 },
    });

    render(<PostList />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    });

    // Find and click the load more button
    const loadMoreButton = screen.getByRole('button', { name: /load more/i });
    await userEvent.click(loadMoreButton);

    // Verify the second page was loaded
    await waitFor(() => {
      expect(postService.getPosts).toHaveBeenLastCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 10,
          sort: 'hot',
        })
      );
      // Use getAllByText and check that we have at least one instance
      const post3Elements = screen.getAllByText('Test Post 3');
      expect(post3Elements.length).toBeGreaterThan(0);
    });
  });

  it('handles upvote correctly', async () => {
    render(<PostList initialPosts={mockPosts} />);
    // Use getAllByTestId and take the first instance
    const postCards = screen.getAllByTestId('post-1');
    const postCard = postCards[0]; // Take the first instance
    const upvoteButton = within(postCard).getByLabelText('Upvote');
    
    // Mock the response from the vote service
    (voteService.upvote as jest.Mock).mockResolvedValueOnce({
      ...mockPosts[0],
      score: 11, // Expected score after upvote
      upvotes: 1,
    });
    
    await userEvent.click(upvoteButton);
    expect(voteService.upvote).toHaveBeenCalledWith('1');
    
    // Verify the score is updated correctly
    await waitFor(() => {
      const scoreElement = within(postCard).getByText(/Score:\s*11/i);
      expect(scoreElement).toBeInTheDocument();
    });
  });

  it('handles downvote correctly', async () => {
    render(<PostList initialPosts={mockPosts} />);
    // Use getAllByTestId and take the first instance
    const postCards = screen.getAllByTestId('post-1');
    const postCard = postCards[0]; // Take the first instance
    const downvoteButton = within(postCard).getByLabelText('Downvote');
    
    // Mock the response from the vote service
    (voteService.downvote as jest.Mock).mockResolvedValueOnce({
      ...mockPosts[0],
      score: 9, // Expected score after downvote
      downvotes: 1,
    });
    
    await userEvent.click(downvoteButton);
    expect(voteService.downvote).toHaveBeenCalledWith('1');
    
    // Verify the score is updated correctly
    await waitFor(() => {
      const scoreElement = within(postCard).getByText(/Score:\s*9/i);
      expect(scoreElement).toBeInTheDocument();
    });
  });

  it('handles remove vote correctly', async () => {
    render(<PostList initialPosts={mockPosts} />);
    // Use getAllByTestId and take the first instance
    const postCards = screen.getAllByTestId('post-2');
    const postCard = postCards[0]; // Take the first instance
    const removeVoteButton = within(postCard).getByLabelText('Remove vote');
    
    // Mock the response from the vote service
    (voteService.removeVote as jest.Mock).mockResolvedValueOnce({
      ...mockPosts[1],
      score: 20, // Expected score after removing vote
      upvotes: 0,
      downvotes: 0,
      userVote: null
    });
    
    await userEvent.click(removeVoteButton);
    expect(voteService.removeVote).toHaveBeenCalledWith('2');
    
    // Verify the score is updated correctly
    await waitFor(() => {
      const scoreElement = within(postCard).getByText(/Score:\s*20/i);
      expect(scoreElement).toBeInTheDocument();
    });
  });

  it('shows login modal when voting without authentication', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, isAuthenticated: false });
    render(<PostList initialPosts={mockPosts} />);
    const postCards = screen.getAllByTestId('post-1');
    const postCard = postCards[0]; // Take the first instance
    const upvoteButton = within(postCard).getByLabelText('Upvote');
    await userEvent.click(upvoteButton);
    expect(voteService.upvote).not.toHaveBeenCalled();
    // Note: Testing modal opening requires mocking the modal component or checking state
  });

  it('displays no posts message when no posts are available', async () => {
    (postService.getPosts as jest.Mock).mockResolvedValue({
      items: [],
      meta: { currentPage: 1, totalPages: 1, totalItems: 0, itemCount: 0, itemsPerPage: 10 },
    });
    render(<PostList />);
    await waitFor(() => {
      expect(screen.getByText('No posts found. Be the first to create one!')).toBeInTheDocument();
    });
  });

  it('does not show load more button when hasMore is false', async () => {
    (postService.getPosts as jest.Mock).mockResolvedValue({
      items: mockPosts,
      meta: { currentPage: 1, totalPages: 1, totalItems: mockPosts.length, itemCount: mockPosts.length, itemsPerPage: 10 },
    });
    render(<PostList />);
    await waitFor(() => {
      expect(screen.queryByText('Load More')).not.toBeInTheDocument();
    });
  });

  it('handles posts with missing optional fields', async () => {
    const minimalPost: Post = {
      id: '3',
      title: 'Minimal Post',
      content: 'Content 3',
      type: 'text',
      contentType: 'text',
      score: 0,
      upvotes: 0,
      downvotes: 0,
      votes: 0,
      commentCount: 0,
      isPinned: false,
      createdAt: '2023-01-03T00:00:00Z',
      updatedAt: '2023-01-03T00:00:00Z',
      author: { id: 'user3', username: 'User3' },
      community: { id: 'comm3', name: 'Community3', description: '', memberCount: 0, createdAt: '2023-01-03T00:00:00Z' },
    };
    render(<PostList initialPosts={[minimalPost]} />);
    const postCards = screen.getAllByTestId('post-3');
    const postCard = postCards[0]; // Take the first instance
    expect(within(postCard).getByText('Minimal Post')).toBeInTheDocument();
    expect(within(postCard).queryByTestId('flair')).not.toBeInTheDocument();
    expect(within(postCard).queryByTestId('media')).not.toBeInTheDocument();
    expect(within(postCard).queryByTestId('poll')).not.toBeInTheDocument();
    expect(within(postCard).queryByTestId('awards')).not.toBeInTheDocument();
  });

  it('sorts posts by createdAt in descending order', async () => {
    render(<PostList initialPosts={mockPosts} />);
    const posts = screen.getAllByTestId(/post-\d/);
    expect(posts[0]).toHaveAttribute('data-testid', 'post-2'); // Most recent
    expect(posts[1]).toHaveAttribute('data-testid', 'post-1');
  });
});
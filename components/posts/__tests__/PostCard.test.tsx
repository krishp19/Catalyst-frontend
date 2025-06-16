import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { advanceTo, clear } from 'jest-date-mock';
import { PostCard } from '../PostCard';
import { PostWithVote } from '../../../src/types/post.types';

// Mock @radix-ui/react-dropdown-menu
jest.mock('@radix-ui/react-dropdown-menu', () => ({
  Root: ({ children, ...props }: any) => <div data-testid="dropdown-root" {...props}>{children}</div>,
  Trigger: ({ children, ...props }: any) => <button data-testid="dropdown-trigger" {...props}>{children}</button>,
  Portal: ({ children }: any) => <div data-testid="dropdown-portal">{children}</div>,
  Content: ({ children, ...props }: any) => <div data-testid="dropdown-content" {...props}>{children}</div>,
  Item: ({ children, ...props }: any) => <div data-testid="dropdown-item" {...props}>{children}</div>,
  CheckboxItem: Object.assign(
    ({ children, ...props }: any) => <div data-testid="dropdown-checkbox-item" {...props}>{children}</div>,
    { displayName: 'DropdownMenuCheckboxItem' }
  ),
  RadioItem: Object.assign(
    ({ children, ...props }: any) => <div data-testid="dropdown-radio-item" {...props}>{children}</div>,
    { displayName: 'DropdownMenuRadioItem' }
  ),
  Label: ({ children, ...props }: any) => <div data-testid="dropdown-label" {...props}>{children}</div>,
  Separator: (props: any) => <div data-testid="dropdown-separator" {...props} />,
  Shortcut: ({ children, ...props }: any) => <span data-testid="dropdown-shortcut" {...props}>{children}</span>,
  Group: ({ children, ...props }: any) => <div data-testid="dropdown-group" {...props}>{children}</div>,
  Sub: ({ children, ...props }: any) => <div data-testid="dropdown-sub" {...props}>{children}</div>,
  SubTrigger: Object.assign(
    ({ children, ...props }: any) => <div data-testid="dropdown-sub-trigger" {...props}>{children}</div>,
    { displayName: 'DropdownMenuPrimitive.SubTrigger' }
  ),
  SubContent: Object.assign(
    ({ children, ...props }: any) => <div data-testid="dropdown-sub-content" {...props}>{children}</div>,
    { displayName: 'DropdownMenuPrimitive.SubContent' }
  ),
  RadioGroup: ({ children, ...props }: any) => <div data-testid="dropdown-radio-group" {...props}>{children}</div>,
  ItemIndicator: ({ children, ...props }: any) => <div data-testid="dropdown-item-indicator" {...props}>{children}</div>,
  // Add display names for primitive components
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
}));

// Mock dependencies
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, fill, sizes, className, quality, onError, unoptimized }: any) => (
    <img
      src={src}
      alt={alt}
      style={fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%' } : {}}
      className={className}
      sizes={sizes}
      data-quality={quality}
      onError={onError}
      data-unoptimized={unoptimized}
    />
  ),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

// Mock date-fns to handle named export correctly
jest.mock('date-fns', () => ({
  __esModule: true,
  formatDistanceToNow: jest.fn(() => '2 hours ago'),
}));

// Base mock post data
const mockPost: PostWithVote = {
    id: 'post1',
    title: 'Test Post',
    content: '<p>This is a test post content</p>',
    type: 'text',
    score: 10,
    userVote: null,
    createdAt: new Date('2025-06-13T13:00:00Z').toISOString(),
    updatedAt: new Date('2025-06-13T14:00:00Z').toISOString(),
    commentCount: 5,
    upvotes: 15,
    downvotes: 5,
    isPinned: false,
    author: {
        id: 'user1',
        username: 'testuser',
        avatarUrl: '/user-avatar.png',
    },
    community: {
        id: 'community1',
        name: 'testcommunity',
        description: 'A test community',
        iconUrl: '/community-icon.png',
        memberCount: 100,
        createdAt: new Date('2025-01-01T00:00:00Z').toISOString(),
    },
    tags: ['tag1', 'tag2'],
    imageUrl: undefined,
    linkUrl: undefined,
    awards: [],
    contentType: 'poll',
    votes: 0
};

describe('PostCard', () => {
  const onVote = jest.fn();
  const onRemoveVote = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    advanceTo(new Date('2025-06-13T15:00:00Z')); // Set consistent date
  });

  afterEach(() => {
    clear(); // Clear mocked date
  });

  test('renders post title, author, and community correctly', () => {
    render(<PostCard post={mockPost} />);
    
    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('r/testcommunity')).toBeInTheDocument();
    expect(screen.getByText('u/testuser')).toBeInTheDocument();
    // The time text is split across multiple elements, so we'll check the parent element's text content
    const timeContainer = screen.getByText('Posted by').parentElement;
    expect(timeContainer).toHaveTextContent('about 2 hours ago');
  });

  test('renders text post content correctly', () => {
    render(<PostCard post={mockPost} />);
    
    expect(screen.getByText('This is a test post content')).toBeInTheDocument();
  });

  test('renders image post correctly', () => {
    const imagePost: PostWithVote = {
      ...mockPost,
      type: 'image',
      content: '',
      imageUrl: '/test-image.jpg',
    };
    
    render(<PostCard post={imagePost} />);
    
    const image = screen.getByRole('img', { name: 'Test Post' });
    expect(image).toHaveAttribute('src', '/test-image.jpg');
    expect(image).toHaveAttribute('data-quality', '75');
  });

  test('handles image load error by setting placeholder', async () => {
    const imagePost: PostWithVote = {
      ...mockPost,
      type: 'image',
      content: '',
      imageUrl: '/broken-image.jpg',
    };
    
    render(<PostCard post={imagePost} />);
    
    const image = screen.getByRole('img', { name: 'Test Post' });
    fireEvent.error(image);
    
    expect(image).toHaveAttribute('src', '/placeholder-image.jpg');
  });

  test('renders GIF image with unoptimized prop', () => {
    const gifPost: PostWithVote = {
      ...mockPost,
      type: 'image',
      content: '',
      imageUrl: '/test-image.gif',
    };
    
    render(<PostCard post={gifPost} />);
    
    const image = screen.getByRole('img', { name: 'Test Post' });
    expect(image).toHaveAttribute('data-unoptimized', 'true');
  });

  test('renders link post correctly', () => {
    const linkPost: PostWithVote = {
      ...mockPost,
      type: 'link',
      content: '',
      linkUrl: 'https://example.com',
    };
    
    render(<PostCard post={linkPost} />);
    
    const link = screen.getByRole('link', { name: 'https://example.com' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('renders tags correctly', () => {
    render(<PostCard post={mockPost} />);
    
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
  });

  test('handles upvote interaction correctly', async () => {
    render(<PostCard post={mockPost} onVote={onVote} />);
    
    const upvoteButton = screen.getByRole('button', { name: 'Upvote' });
    await userEvent.click(upvoteButton);
    
    expect(onVote).toHaveBeenCalledWith('post1', 'upvote');
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(upvoteButton).toHaveClass('text-orange-500');
  });

  test('handles downvote interaction correctly', async () => {
    render(<PostCard post={mockPost} onVote={onVote} />);
    
    const downvoteButton = screen.getByRole('button', { name: 'Downvote' });
    await userEvent.click(downvoteButton);
    
    expect(onVote).toHaveBeenCalledWith('post1', 'downvote');
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(downvoteButton).toHaveClass('text-blue-500');
  });

  test('handles removing upvote correctly', async () => {
    const upvotedPost: PostWithVote = {
      ...mockPost,
      userVote: 'up',
      score: 11,
    };
    render(<PostCard post={upvotedPost} onVote={onVote} onRemoveVote={onRemoveVote} />);
    
    const upvoteButton = screen.getByRole('button', { name: 'Upvote' });
    await userEvent.click(upvoteButton);
    
    expect(onRemoveVote).toHaveBeenCalledWith('post1');
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(upvoteButton).not.toHaveClass('text-orange-500');
  });

  test('handles removing downvote correctly', async () => {
    const downvotedPost: PostWithVote = {
      ...mockPost,
      userVote: 'down',
      score: 9,
    };
    render(<PostCard post={downvotedPost} onVote={onVote} onRemoveVote={onRemoveVote} />);
    
    const downvoteButton = screen.getByRole('button', { name: 'Downvote' });
    await userEvent.click(downvoteButton);
    
    expect(onRemoveVote).toHaveBeenCalledWith('post1');
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(downvoteButton).not.toHaveClass('text-blue-500');
  });

  test('handles vote error gracefully', async () => {
    onVote.mockRejectedValueOnce(new Error('Vote failed'));
    render(<PostCard post={mockPost} onVote={onVote} />);
    
    const upvoteButton = screen.getByRole('button', { name: 'Upvote' });
    await userEvent.click(upvoteButton);
    
    expect(onVote).toHaveBeenCalled();
    // The vote count should remain the same on error
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  test('disables voting buttons when isVoting is true', () => {
    render(<PostCard post={mockPost} isVoting={true} />);
    
    const upvoteButton = screen.getByRole('button', { name: 'Upvote' });
    const downvoteButton = screen.getByRole('button', { name: 'Downvote' });
    
    expect(upvoteButton).toBeDisabled();
    expect(downvoteButton).toBeDisabled();
  });

  test('shows loading spinner during upvote when isVoting is true', () => {
    const upvotedPost: PostWithVote = {
      ...mockPost,
      userVote: 'up',
    };
    render(<PostCard post={upvotedPost} isVoting={true} />);
    
    // The loader is the Loader2 component from lucide-react
    expect(screen.getByRole('button', { name: 'Upvote' }).querySelector('.animate-spin')).toBeInTheDocument();
  });

  test('shows loading spinner during downvote when isVoting is true', () => {
    const downvotedPost: PostWithVote = {
      ...mockPost,
      userVote: 'down',
    };
    render(<PostCard post={downvotedPost} isVoting={true} />);
    
    // The loader is the Loader2 component from lucide-react
    expect(screen.getByRole('button', { name: 'Downvote' }).querySelector('.animate-spin')).toBeInTheDocument();
  });

  test('toggles save button state correctly', async () => {
    render(<PostCard post={mockPost} />);
    
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await userEvent.click(saveButton);
    
    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(saveButton).toHaveClass('text-yellow-500');
    
    await userEvent.click(saveButton);
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(saveButton).not.toHaveClass('text-yellow-500');
  });

  test('renders dropdown menu items and handles clicks', async () => {
    render(<PostCard post={mockPost} />);
    
    // Find the more button by its test ID from our mock
    const moreButton = screen.getByTestId('dropdown-trigger');
    await userEvent.click(moreButton);
    
    // The dropdown content should be visible now
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
    
    // Check for dropdown items
    expect(screen.getByText('Hide')).toBeInTheDocument();
    expect(screen.getByText('Report')).toBeInTheDocument();
    expect(screen.getByText('Copy link')).toBeInTheDocument();

    // Test clicking a dropdown item (e.g., Copy link)
    const copyLinkItem = screen.getByText('Copy link');
    await userEvent.click(copyLinkItem);
    // Note: Actual copy-to-clipboard behavior would require additional mocking
  });

  test('renders comment count correctly', () => {
    render(<PostCard post={mockPost} />);
    
    expect(screen.getByText('5 Comments')).toBeInTheDocument();
  });

  test('handles post with no tags correctly', () => {
    const noTagsPost: PostWithVote = {
      ...mockPost,
      tags: [],
    };
    render(<PostCard post={noTagsPost} />);
    
    expect(screen.queryByText('tag1')).not.toBeInTheDocument();
  });

  test('renders correct links for post, community, and user', () => {
    render(<PostCard post={mockPost} />);
    
    expect(screen.getByText('Test Post').closest('a')).toHaveAttribute('href', '/post/post1');
    expect(screen.getByText('r/testcommunity')).toHaveAttribute('href', '/r/testcommunity');
    expect(screen.getByText('u/testuser')).toHaveAttribute('href', '/user/testuser');
  });

  test('handles vote status styling for upvote', () => {
    const upvotedPost: PostWithVote = {
      ...mockPost,
      userVote: 'up',
    };
    render(<PostCard post={upvotedPost} />);
    
    expect(screen.getByText('10')).toHaveClass('text-orange-500');
  });

  test('handles vote status styling for downvote', () => {
    const downvotedPost: PostWithVote = {
      ...mockPost,
      userVote: 'down',
    };
    render(<PostCard post={downvotedPost} />);
    
    expect(screen.getByText('10')).toHaveClass('text-blue-500');
  });

  test('handles share button rendering', () => {
    render(<PostCard post={mockPost} />);
    
    const shareButton = screen.getByRole('button', { name: 'Share' });
    expect(shareButton).toBeInTheDocument();
  });

  test('handles community avatar fallback', () => {
    const noIconPost: PostWithVote = {
      ...mockPost,
      community: {
        ...mockPost.community,
        iconUrl: '',
      },
    };
    render(<PostCard post={noIconPost} />);
    
    const avatar = screen.getByText('t'); // First letter of community name
    expect(avatar).toBeInTheDocument();
  });

  test('handles hover state for post title', () => {
    render(<PostCard post={mockPost} />);
    
    const title = screen.getByText('Test Post');
    fireEvent.mouseOver(title);
    expect(title).toHaveClass('group-hover:text-blue-500');
  });
});
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAppSelector } from '../../../src/store/hooks';
import { communityService } from '../../../src/services/communityService';
import Sidebar from '../Sidebar';

// Mock dependencies
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));
jest.mock('../../../src/store/hooks', () => ({
  useAppSelector: jest.fn(),
}));
jest.mock('../../../src/services/communityService', () => ({
  communityService: {
    getJoinedCommunities: jest.fn(),
  },
}));
jest.mock('../../communities/CreateCommunityModal', () => ({
  CreateCommunityModal: ({ open }: { open: boolean }) => (
    open ? <div data-testid="mock-create-community-modal">Create Community Modal</div> : null
  ),
}));

// Extend Jest with custom matchers
import '@testing-library/jest-dom';

// Sample community data
const mockCommunities = [
  { id: '1', name: 'community1', iconUrl: '/icon1.png', memberCount: 1000 },
  { id: '2', name: 'community2', iconUrl: '/icon2.png', memberCount: 2000 },
];

describe('Sidebar Component', () => {
  let mockSetTheme: jest.Mock<any, any, any>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetTheme = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });
    (useAppSelector as jest.Mock).mockReturnValue({ isAuthenticated: false });
    (usePathname as jest.Mock).mockReturnValue('/');
    (communityService.getJoinedCommunities as jest.Mock).mockResolvedValue({
      items: [],
    });
  });

  // Test 1: Renders Sidebar with Feeds section
  it('renders Feeds section with Home, Popular, and All links', () => {
    render(<Sidebar />);
    expect(screen.getByText('FEEDS')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Popular')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
  });

  // Test 2: Renders Topics section with all topic links
  it('renders Topics section with all topic links', () => {
    render(<Sidebar />);
    expect(screen.getByText('TOPICS')).toBeInTheDocument();
    expect(screen.getByText('Gaming')).toBeInTheDocument();
    expect(screen.getByText('Music')).toBeInTheDocument();
    expect(screen.getByText('Movies & TV')).toBeInTheDocument();
    expect(screen.getByText('Books & Writing')).toBeInTheDocument();
    expect(screen.getByText('Art')).toBeInTheDocument();
  });

  // Test 3: Renders Resources section with Settings, Help Center, and theme toggle
  it('renders Resources section with Settings, Help Center, and theme toggle', () => {
    render(<Sidebar />);
    expect(screen.getByText('RESOURCES')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Help Center')).toBeInTheDocument();
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
  });

  // Test 4: Highlights active link based on pathname
  it('highlights active link based on pathname', () => {
    (usePathname as jest.Mock).mockReturnValue('/popular');
    render(<Sidebar />);
    const popularLink = screen.getByText('Popular').closest('a');
    expect(popularLink).toHaveClass('bg-accent text-accent-foreground');
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).not.toHaveClass('bg-accent text-accent-foreground');
  });

  // Test 5: Does not show Create Community button when unauthenticated
  it('does not show Create Community button when unauthenticated', () => {
    render(<Sidebar />);
    expect(screen.queryByText('Create Community')).not.toBeInTheDocument();
  });

  // Test 6: Shows Create Community button and opens modal when authenticated
  it('shows Create Community button and opens modal when authenticated', () => {
    (useAppSelector as jest.Mock).mockReturnValue({ isAuthenticated: true });
    render(<Sidebar />);
    const createButton = screen.getByText('Create Community');
    expect(createButton).toBeInTheDocument();
    fireEvent.click(createButton);
    expect(screen.getByTestId('mock-create-community-modal')).toBeInTheDocument();
  });

  // Test 7: Shows "Sign in to see your communities" when unauthenticated
  it('shows sign-in message when unauthenticated', () => {
    render(<Sidebar />);
    expect(screen.getByText('Sign in to see your communities')).toBeInTheDocument();
  });

  // Test 8: Shows loading skeletons when authenticated and communities are loading
  it('shows loading skeletons when authenticated and communities are loading', async () => {
    (useAppSelector as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (communityService.getJoinedCommunities as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ items: [] }), 1000))
    );
    
    render(<Sidebar />);
    
    // Verify the loading state renders the correct number of skeleton items
    const skeletonItems = screen.getAllByTestId('community-skeleton');
    expect(skeletonItems).toHaveLength(3);
    
    // Verify skeleton avatars and names
    const skeletonAvatars = screen.getAllByTestId('skeleton-avatar');
    const skeletonNames = screen.getAllByTestId('skeleton-name');
    
    expect(skeletonAvatars).toHaveLength(3);
    expect(skeletonNames).toHaveLength(3);
    
    await waitFor(() => {
      expect(screen.getByText('You haven\'t joined any communities yet')).toBeInTheDocument();
    });
  });

  // Test 9: Renders joined communities when authenticated and communities are loaded
  it('renders joined communities when authenticated', async () => {
    (useAppSelector as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (communityService.getJoinedCommunities as jest.Mock).mockResolvedValue({
      items: mockCommunities,
    });
    render(<Sidebar />);
    await waitFor(() => {
      expect(screen.getByText('r/community1')).toBeInTheDocument();
      expect(screen.getByText('1,000 members')).toBeInTheDocument();
      expect(screen.getByText('r/community2')).toBeInTheDocument();
      expect(screen.getByText('2,000 members')).toBeInTheDocument();
    });
  });

  // Test 10: Shows "You haven't joined any communities yet" when authenticated but no communities
  it('shows no communities message when authenticated but no communities', async () => {
    (useAppSelector as jest.Mock).mockReturnValue({ isAuthenticated: true });
    render(<Sidebar />);
    await waitFor(() => {
      expect(screen.getByText('You haven\'t joined any communities yet')).toBeInTheDocument();
    });
  });

  // Test 11: Toggles theme when theme button is clicked
  it('toggles theme when theme button is clicked', () => {
    render(<Sidebar />);
    const themeButton = screen.getByText('Dark Mode');
    fireEvent.click(themeButton);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  // Test 12: Shows Light Mode button when theme is dark
  it('shows Light Mode button when theme is dark', () => {
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    });
    render(<Sidebar />);
    expect(screen.getByText('Light Mode')).toBeInTheDocument();
  });

  // Test 13: Handles community fetch error gracefully
  it('handles community fetch error gracefully', async () => {
    (useAppSelector as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (communityService.getJoinedCommunities as jest.Mock).mockRejectedValue(new Error('Fetch error'));
    render(<Sidebar />);
    await waitFor(() => {
      expect(screen.getByText('You haven\'t joined any communities yet')).toBeInTheDocument();
    });
  });

  // Test 14: Applies active styles to current community link
  it('applies active styles to current community link', async () => {
    (useAppSelector as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (usePathname as jest.Mock).mockReturnValue('/r/community1');
    (communityService.getJoinedCommunities as jest.Mock).mockResolvedValue({
      items: mockCommunities,
    });
    render(<Sidebar />);
    await waitFor(() => {
      const communityLink = screen.getByText('r/community1').closest('a');
      expect(communityLink).toHaveClass('bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium');
    });
  });
});
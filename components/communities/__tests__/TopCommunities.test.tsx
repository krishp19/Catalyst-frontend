import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { TopCommunities } from '../TopCommunities';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { communityService } from '../../../src/services/communityService';
import { useAppSelector } from '../../../src/store/hooks';
import { toast } from 'sonner';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../src/store/hooks', () => ({
  useAppSelector: jest.fn(),
}));

jest.mock('../../../src/services/communityService', () => ({
  communityService: {
    getCommunities: jest.fn(),
    getMyJoinedCommunities: jest.fn(),
    joinCommunity: jest.fn(),
    leaveCommunity: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock data
const mockCommunities = [
  {
    id: '1',
    name: 'community1',
    iconUrl: 'http://example.com/icon1.png',
    memberCount: 1000,
  },
  {
    id: '2',
    name: 'community2',
    iconUrl: 'http://example.com/icon2.png',
    memberCount: 500,
  },
];

const mockJoinedCommunities = [{ id: '1' }];

describe('TopCommunities Component', () => {
  let mockPush: jest.Mock;
  let mockSetIsLoginModalOpen: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock router
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    // Mock auth context
    mockSetIsLoginModalOpen = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'user1' },
      setIsLoginModalOpen: mockSetIsLoginModalOpen,
    });

    // Mock Redux selector
    (useAppSelector as jest.Mock).mockReturnValue({ isAuthenticated: true });

    // Mock community service
    (communityService.getCommunities as jest.Mock).mockResolvedValue({ items: mockCommunities });
    (communityService.getMyJoinedCommunities as jest.Mock).mockResolvedValue(mockJoinedCommunities);
    (communityService.joinCommunity as jest.Mock).mockResolvedValue(undefined);
    (communityService.leaveCommunity as jest.Mock).mockResolvedValue(undefined);
  });

  it('renders loading state initially', () => {
    const { container } = render(<TopCommunities />);
    // Query loading placeholders by class name
    const placeholders = container.querySelectorAll('.animate-pulse');
    expect(placeholders.length).toBeGreaterThanOrEqual(9); // 3 placeholders, each with 3 elements (avatar, name, members)
    expect(screen.getByText('Top Growing Communities')).toBeInTheDocument();
  });

  it('renders communities after fetching', async () => {
    render(<TopCommunities />);
    await waitFor(() => {
      expect(screen.getByText('r/community1')).toBeInTheDocument();
      expect(screen.getByText('r/community2')).toBeInTheDocument();
      expect(screen.getByText('1,000 members')).toBeInTheDocument();
      expect(screen.getByText('500 members')).toBeInTheDocument();
    });
    expect(communityService.getCommunities).toHaveBeenCalled();
    expect(communityService.getMyJoinedCommunities).toHaveBeenCalled();
  });

  it('displays error message on fetch failure', async () => {
    (communityService.getCommunities as jest.Mock).mockRejectedValue(new Error('Fetch error'));
    render(<TopCommunities />);
    await waitFor(() => {
      expect(screen.getByText('Fetch error')).toBeInTheDocument();
    });
  });

  it('shows "Joined" button for joined communities and "Join" for others', async () => {
    render(<TopCommunities />);
    await waitFor(() => {
      expect(screen.getByText('Joined')).toBeInTheDocument(); // community1
      expect(screen.getByText('Join')).toBeInTheDocument(); // community2
    });
  });

  it('handles join community when authenticated', async () => {
    render(<TopCommunities />);
    await waitFor(() => {
      const joinButtons = screen.getAllByText('Join');
      expect(joinButtons).toHaveLength(1); // Only community2 has Join
    });

    const joinButton = screen.getAllByText('Join')[0];
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(communityService.joinCommunity).toHaveBeenCalledWith('2');
      expect(toast.success).toHaveBeenCalledWith('Successfully joined the community');
      const joinedButtons = screen.getAllByText('Joined');
      expect(joinedButtons).toHaveLength(2); // Both communities now Joined
      expect(screen.getByText('501 members')).toBeInTheDocument(); // Member count increments
    });
  });

  it('handles leave community when authenticated', async () => {
    render(<TopCommunities />);
    await waitFor(() => {
      const joinedButtons = screen.getAllByText('Joined');
      expect(joinedButtons).toHaveLength(1); // Only community1 has Joined
    });

    const leaveButton = screen.getAllByText('Joined')[0];
    fireEvent.click(leaveButton);

    await waitFor(() => {
      expect(communityService.leaveCommunity).toHaveBeenCalledWith('1');
      expect(toast.success).toHaveBeenCalledWith('Successfully left the community');
      const joinButtons = screen.getAllByText('Join');
      expect(joinButtons).toHaveLength(2); // Both communities now Join
      expect(screen.getByText('999 members')).toBeInTheDocument(); // Member count decrements
    });
  });

  it('shows login modal when joining without authentication', async () => {
    (useAppSelector as jest.Mock).mockReturnValue({ isAuthenticated: false });
    render(<TopCommunities />);
    await waitFor(() => {
      const joinButtons = screen.getAllByText('Join');
      expect(joinButtons).toHaveLength(2); // Both communities show Join
    });

    const joinButton = screen.getAllByText('Join')[0];
    fireEvent.click(joinButton);

    expect(mockSetIsLoginModalOpen).toHaveBeenCalledWith(true);
    expect(communityService.joinCommunity).not.toHaveBeenCalled();
  });

  it('displays error toast on join failure', async () => {
    (communityService.joinCommunity as jest.Mock).mockRejectedValue(new Error('Join error'));
    render(<TopCommunities />);
    await waitFor(() => {
      expect(screen.getByText('Join')).toBeInTheDocument();
    });

    const joinButton = screen.getAllByText('Join')[0];
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to join community');
    });
  });

  it('displays error toast on leave failure', async () => {
    (communityService.leaveCommunity as jest.Mock).mockRejectedValue(new Error('Leave error'));
    render(<TopCommunities />);
    await waitFor(() => {
      expect(screen.getByText('Joined')).toBeInTheDocument();
    });

    const leaveButton = screen.getAllByText('Joined')[0];
    fireEvent.click(leaveButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to leave community');
    });
  });

  it('navigates to community page on link click', async () => {
    render(<TopCommunities />);
    await waitFor(() => {
      expect(screen.getByText('r/community1')).toBeInTheDocument();
    });

    const communityLink = screen.getByText('r/community1').closest('a');
    expect(communityLink).toHaveAttribute('href', '/r/community1');
  });

  it('navigates to all communities on "View All" click', async () => {
    render(<TopCommunities />);
    await waitFor(() => {
      expect(screen.getByText('View All')).toBeInTheDocument();
    });

    const viewAllButton = screen.getByText('View All');
    fireEvent.click(viewAllButton);

    expect(mockPush).toHaveBeenCalledWith('/communities');
  });

  it('disables join/leave button while processing', async () => {
    render(<TopCommunities />);
    await waitFor(() => {
      expect(screen.getByText('Join')).toBeInTheDocument();
    });

    const joinButton = screen.getAllByText('Join')[0];
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(screen.getByText('Joining...')).toBeDisabled();
    });
  });

  it('clears joined communities when not authenticated', async () => {
    (useAppSelector as jest.Mock).mockReturnValue({ isAuthenticated: false });
    render(<TopCommunities />);
    await waitFor(() => {
      expect(screen.getAllByText('Join')).toHaveLength(2); // Both communities show Join
    });
    // No expectation for getMyJoinedCommunities since it's not called when unauthenticated
  });

  it('renders community avatar with fallback', async () => {
    const communitiesNoIcon = [
      {
        id: '1',
        name: 'community1',
        iconUrl: '',
        memberCount: 1000,
      },
    ];
    (communityService.getCommunities as jest.Mock).mockResolvedValue({ items: communitiesNoIcon });
    render(<TopCommunities />);
    await waitFor(() => {
      expect(screen.getByText('C')).toBeInTheDocument(); // Fallback avatar with 'C'
    });
  });
});
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateCommunityModal } from '../CreateCommunityModal';
import { topicService } from '../../../src/services/topic.service';
import { communityService } from '../../../src/services/communityService';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { act } from 'react-dom/test-utils';

// Mock dependencies
jest.mock('../../../src/services/topic.service');
jest.mock('../../../src/services/communityService');
jest.mock('sonner');
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ImagePlus: () => <span>ImagePlus</span>,
  X: () => <span>X</span>,
  ChevronLeft: () => <span>ChevronLeft</span>,
  ChevronRight: () => <span>ChevronRight</span>,
  Check: () => <span>Check</span>,
  Pencil: () => <span>Pencil</span>,
  Plus: () => <span>Plus</span>,
  Search: () => <span>Search</span>,
}));

describe('CreateCommunityModal', () => {
  const mockOnOpenChange = jest.fn();
  const mockOnSuccess = jest.fn();
  const user = userEvent.setup({ delay: null });

  const mockCommunity = {
    id: '1',
    name: 'TestCommunity',
    description: 'Test description',
    iconUrl: 'http://test.com/icon.jpg',
    bannerUrl: 'http://test.com/banner.jpg',
    topics: [
      {
        id: 't1',
        name: 'Topic1',
        description: 'Topic description',
        usageCount: 10,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
    ],
  };

  const mockTopics = [
    {
      id: 't2',
      name: 'Topic2',
      description: 'Topic 2 description',
      usageCount: 5,
      createdAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z',
    },
    {
      id: 't3',
      name: 'Topic3',
      description: 'Topic 3 description',
      usageCount: 8,
      createdAt: '2023-01-03T00:00:00Z',
      updatedAt: '2023-01-03T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ theme: 'light' });
    (topicService.getTopics as jest.Mock).mockResolvedValue({ topics: mockTopics });
    (communityService.createCommunity as jest.Mock).mockResolvedValue({ id: 'new-id' });
    (communityService.updateCommunity as jest.Mock).mockResolvedValue({});
    (toast.error as jest.Mock).mockImplementation(() => {});
    (toast.success as jest.Mock).mockImplementation(() => {});
  });

  it('renders closed modal when open is false', () => {
    render(
      <CreateCommunityModal
        open={false}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );
    expect(screen.queryByText('Create Community')).not.toBeInTheDocument();
  });

  it('renders create modal when open is true', () => {
    render(
      <CreateCommunityModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Name your community')).toBeInTheDocument();
  });

  it('renders edit modal when community prop is provided', () => {
    render(
      <CreateCommunityModal
        open={true}
        onOpenChange={mockOnOpenChange}
        community={mockCommunity}
        onSuccess={mockOnSuccess}
      />
    );
    expect(screen.getByText('Edit Community')).toBeInTheDocument();
    expect(screen.getByDisplayValue('TestCommunity')).toBeInTheDocument();
  });

  it('displays validation error for invalid community name', async () => {
    render(
      <CreateCommunityModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByPlaceholderText('communityname');
    await user.clear(nameInput);
    await user.type(nameInput, 'ab'); // Too short
    const nextButton = screen.getByRole('button', { name: /Next/i });

    // Check if Next button is disabled
    if (nextButton.hasAttribute('disabled')) {
      expect(nextButton).toBeDisabled();
    } else {
      await user.click(nextButton);
      await waitFor(() => {
        // Check for inline error or toast
        const errorMessage = screen.queryByText(/Name is too short|Community name must be between|Invalid community name/i);
        if (errorMessage) {
          expect(errorMessage).toBeInTheDocument();
        } else {
          expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('name'), expect.any(Object));
        }
      });
    }
    expect(screen.getByText('Name your community')).toBeInTheDocument(); // Still on step 1
  });

  it('navigates through steps correctly', async () => {
    render(
      <CreateCommunityModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByPlaceholderText('communityname');
    await user.type(nameInput, 'ValidName123');
    await user.click(screen.getByRole('button', { name: /Next/i }));
    await waitFor(() => {
      expect(screen.getByText('Add topics')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Next/i }));
    await waitFor(() => {
      expect(screen.getByText('Add images (Optional)')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Back/i }));
    await waitFor(() => {
      expect(screen.getByText('Add topics')).toBeInTheDocument();
    });
  });

  it('searches and adds topics', async () => {
    (topicService.getTopics as jest.Mock).mockResolvedValueOnce({ topics: mockTopics });

    render(
      <CreateCommunityModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    // Go to topics step
    const nameInput = screen.getByPlaceholderText('communityname');
    await user.type(nameInput, 'ValidName123');
    await user.click(screen.getByRole('button', { name: /Next/i }));

    // Search for topics
    const searchInput = screen.getByPlaceholderText('Search topics...');
    await user.type(searchInput, 'test');

    // Wait for debounce (300ms) and topic rendering
    await waitFor(
      () => {
        expect(topicService.getTopics).toHaveBeenCalledWith('test', 1, 10);
        expect(screen.getByText('Topic2')).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // Select a topic
    await user.click(screen.getByRole('button', { name: /Topic2/i }));
    await waitFor(() => {
      expect(screen.getByText('Topic2')).toBeInTheDocument(); // Topic appears in selected topics
      expect(searchInput).toHaveValue('');
    });
  });

  it('removes selected topic', async () => {
    (topicService.getTopics as jest.Mock).mockResolvedValueOnce({ topics: mockTopics });

    render(
      <CreateCommunityModal
        open={true}
        onOpenChange={mockOnOpenChange}
        community={{ ...mockCommunity, topics: [mockTopics[0]] }} // Use Topic2
        onSuccess={mockOnSuccess}
      />
    );

    // Go to topics step
    const nameInput = screen.getByPlaceholderText('communityname');
    await user.clear(nameInput);
    await user.type(nameInput, 'ValidName123');
    await user.click(screen.getByRole('button', { name: /Next/i }));

    await waitFor(() => {
      expect(screen.getByText('Topic2')).toBeInTheDocument(); // Topic2 is in selected topics
    });

    // Remove topic
    const selectedTopicsContainer = screen.getByText('Selected Topics').parentElement;
    const removeButton = within(selectedTopicsContainer).getByRole('button', { name: /X/i });
    await user.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('Topic2')).not.toBeInTheDocument();
    });
  });

  it('uploads and previews icon image', async () => {
    render(
      <CreateCommunityModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    // Go to images step
    const nameInput = screen.getByPlaceholderText('communityname');
    await user.type(nameInput, 'ValidName123');
    await user.click(screen.getByRole('button', { name: /Next/i }));
    await user.click(screen.getByRole('button', { name: /Next/i }));

    const file = new File(['image'], 'test.png', { type: 'image/png' });
    const input = document.getElementById('icon-upload') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [file] });

    // Trigger the change event manually since we're not using user.upload
    const event = new Event('change', { bubbles: true });
    input.dispatchEvent(event);

    await waitFor(() => {
      expect(screen.getByAltText('Icon preview')).toBeInTheDocument();
    });
  });

  it('creates new community successfully', async () => {
    (topicService.getTopics as jest.Mock).mockResolvedValueOnce({ topics: mockTopics });

    render(
      <CreateCommunityModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    // Step 1: Enter name
    const nameInput = screen.getByPlaceholderText('communityname');
    await user.type(nameInput, 'ValidName123');
    await user.click(screen.getByRole('button', { name: /Next/i }));

    // Step 2: Add topic
    const searchInput = screen.getByPlaceholderText('Search topics...');
    await user.type(searchInput, 'test');
    await waitFor(
      () => {
        expect(screen.getByText('Topic2')).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
    await user.click(screen.getByRole('button', { name: /Topic2/i }));
    await user.click(screen.getByRole('button', { name: /Next/i }));

    // Step 3: Add description and submit
    const descriptionInput = screen.getByPlaceholderText('Tell us about your community...');
    await user.type(descriptionInput, 'Test description');
    await user.click(screen.getByRole('button', { name: /Create Community/i }));

    await waitFor(() => {
      expect(communityService.createCommunity).toHaveBeenCalledWith({
        name: 'ValidName123',
        description: 'Test description',
        iconUrl: null,
        bannerUrl: null,
        topics: ['t2'],
      });
      expect(toast.success).toHaveBeenCalledWith('Community created successfully!', expect.any(Object));
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('updates existing community successfully', async () => {
    render(
      <CreateCommunityModal
        open={true}
        onOpenChange={mockOnOpenChange}
        community={mockCommunity}
        onSuccess={mockOnSuccess}
      />
    );

    // Step 1: Modify name
    const nameInput = screen.getByPlaceholderText('communityname');
    await user.clear(nameInput);
    await user.type(nameInput, 'UpdatedName');
    await user.click(screen.getByRole('button', { name: /Next/i }));

    // Step 2: Skip topics
    await user.click(screen.getByRole('button', { name: /Next/i }));

    // Step 3: Update description and submit
    const descriptionInput = screen.getByPlaceholderText('Tell us about your community...');
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'Updated description');
    await user.click(screen.getByRole('button', { name: /Create Community/i }));

    await waitFor(() => {
      expect(communityService.updateCommunity).toHaveBeenCalledWith('1', {
        name: 'UpdatedName',
        description: 'Updated description',
        iconUrl: 'http://test.com/icon.jpg',
        bannerUrl: 'http://test.com/banner.jpg',
        topics: ['t1'],
      });
      expect(toast.success).toHaveBeenCalledWith('Community updated successfully!');
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('handles community name conflict error', async () => {
    (communityService.createCommunity as jest.Mock).mockRejectedValueOnce({
      response: { status: 409 },
    });

    render(
      <CreateCommunityModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByPlaceholderText('communityname');
    await user.type(nameInput, 'ValidName123');
    await user.click(screen.getByRole('button', { name: /Next/i }));
    await user.click(screen.getByRole('button', { name: /Next/i }));
    await user.click(screen.getByRole('button', { name: /Create Community/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Community name already exists', expect.any(Object));
    });
  });

  it('closes modal on cancel', async () => {
    render(
      <CreateCommunityModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
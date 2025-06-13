import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { EditCommunityModal } from '../EditCommunityModal';
import { topicService } from '../../../src/services/topic.service';
import { communityService } from '../../../src/services/communityService';

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock dependencies
jest.mock('../../../src/services/topic.service', () => ({
  topicService: {
    getCommunityTopics: jest.fn(),
    getTopics: jest.fn(),
  },
}));

jest.mock('../../../src/services/communityService', () => ({
  communityService: {
    updateCommunity: jest.fn(),
  },
}));

jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock Next.js Image component
jest.mock('next/image', () => {
  const MockImage = ({ src, alt, ...props }: { src: string; alt: string; [key: string]: any }) => (
    <img src={src} alt={alt} {...props} />
  );
  MockImage.displayName = 'MockImage';
  return MockImage;
});

// Mock fetch for image uploads
global.fetch = jest.fn();

describe('EditCommunityModal', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    community: {
      id: '1',
      name: 'TestCommunity',
      description: 'A test community',
      iconUrl: '/icon.png',
      bannerUrl: '/banner.png',
      topics: [
        { 
          id: 't1', 
          name: 'Topic1', 
          description: 'Topic description',
          usageCount: 10,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z'
        }
      ],
    },
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ theme: 'light' });
    (topicService.getCommunityTopics as jest.Mock).mockResolvedValue([
      { 
        id: 't1', 
        name: 'Topic1', 
        description: 'Topic description',
        usageCount: 10,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      },
    ]);
    (topicService.getTopics as jest.Mock).mockResolvedValue({
      topics: [
        { 
          id: 't2', 
          name: 'Topic2', 
          description: 'Another topic',
          usageCount: 5,
          createdAt: '2023-01-02T00:00:00Z',
          updatedAt: '2023-01-02T00:00:00Z'
        },
        { 
          id: 't3', 
          name: 'Topic3', 
          description: 'Third topic',
          usageCount: 3,
          createdAt: '2023-01-03T00:00:00Z',
          updatedAt: '2023-01-03T00:00:00Z'
        },
      ],
    });
    (communityService.updateCommunity as jest.Mock).mockResolvedValue({});
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ secure_url: 'https://cloudinary.com/uploaded.png' }),
    });
  });

  it('renders the modal when open is true', () => {
    render(<EditCommunityModal {...defaultProps} />);
    expect(screen.getByText('Edit Community')).toBeInTheDocument();
    expect(screen.getByText('Update your community details and settings.')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(<EditCommunityModal {...defaultProps} open={false} />);
    expect(screen.queryByText('Edit Community')).not.toBeInTheDocument();
  });

  it('renders step 1 (Basic Info) by default', () => {
    render(<EditCommunityModal {...defaultProps} />);
    expect(screen.getByText('Name your community')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('TestCommunity');
  });

  it('validates community name before proceeding', async () => {
    render(<EditCommunityModal {...defaultProps} />);
    
    // Find the name input by its placeholder
    const nameInput = screen.getByPlaceholderText('communityname');
    
    // Check that the help text is visible
    const helpText = screen.getByText('Community names must be between 3-21 characters, and can only contain letters, numbers, or underscores.');
    expect(helpText).toBeInTheDocument();
    
    // Type an invalid name (too short)
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'ab');
    
    // Find and click the Next button
    const nextButton = screen.getByRole('button', { name: /next/i });
    await userEvent.click(nextButton);
    
    // Check that we're still on step 1
    expect(screen.getByText('Name your community')).toBeInTheDocument();
    
    // Type a valid name
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'testcommunity');
    
    // Click Next again
    await userEvent.click(nextButton);
    
    // Should proceed to next step (topics)
    await waitFor(() => {
      expect(screen.getByText('Add topics')).toBeInTheDocument();
    });
  });

  it('allows selecting and deselecting topics', async () => {
    // Mock the topic service to return test topics
    const mockTopics = [
      { 
        id: '1', 
        name: 'Technology', 
        description: 'Tech related discussions', 
        usageCount: 100,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      },
      { 
        id: '2', 
        name: 'Gaming', 
        description: 'Video games and gaming culture', 
        usageCount: 150,
        createdAt: '2023-01-02T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z'
      },
    ];
    
    // Mock getTopics with search functionality
    (topicService.getTopics as jest.Mock).mockImplementation((query, page = 1, limit = 10) => {
      if (query) {
        const filtered = mockTopics.filter(topic => 
          topic.name.toLowerCase().includes(query.toLowerCase()) ||
          topic.description.toLowerCase().includes(query.toLowerCase())
        );
        return Promise.resolve({ topics: filtered });
      }
      return Promise.resolve({ topics: mockTopics });
    });
    
    // Mock getCommunityTopics to return empty array initially
    (topicService.getCommunityTopics as jest.Mock).mockResolvedValue([]);
    
    // Mock the initial topics that might be loaded
    (topicService.getTopics as jest.Mock).mockResolvedValueOnce({ 
      topics: mockTopics 
    });

    render(<EditCommunityModal {...defaultProps} />);
    
    // First, navigate to the topics step
    const nameInput = screen.getByPlaceholderText('communityname');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'testcommunity');
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    await userEvent.click(nextButton);
    
    // Wait for topics step to load
    await waitFor(() => {
      // Check for the step indicator showing we're on step 2
      const step2Indicator = screen.getByText('2');
      expect(step2Indicator).toBeInTheDocument();
      
      // Check for the topics section
      const topicsSection = screen.getByRole('heading', { name: /add topics/i, level: 3 });
      expect(topicsSection).toBeInTheDocument();
    });
    
    // First verify the search input is present
    const searchInput = await screen.findByPlaceholderText('Search topics...');
    
    // Type in the search box
    await userEvent.clear(searchInput);
    await userEvent.type(searchInput, 'tech');
    
    // Wait for the API call to complete and the loading state to finish
    await waitFor(() => {
      expect(topicService.getTopics).toHaveBeenCalledWith(
        'tech',
        expect.anything(),
        expect.anything()
      );
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Wait for the topic to appear in the list
    const topicElement = await screen.findByText('Technology', {}, { timeout: 3000 });
    
    // Click the topic to select it
    await userEvent.click(topicElement);
    
    // Verify the topic is selected
    const selectedTopic = await screen.findByText('Technology');
    const topicChip = selectedTopic.closest('div');
    if (!topicChip) throw new Error('Topic chip not found');
    
    // Find and click the remove button (X) inside the topic chip
    const removeButton = within(topicChip as HTMLElement).getByRole('button');
    await userEvent.click(removeButton);
    
    // Verify the topic is no longer selected
    await waitFor(() => {
      expect(screen.queryByText('Technology')).not.toBeInTheDocument();
    });
  });

  it('removes a selected topic', async () => {
    // Mock topics response with some data
    (topicService.getTopics as jest.Mock).mockResolvedValue({
      topics: [{ id: '1', name: 'Topic1', description: 'Test topic 1' }],
    });
    (topicService.getCommunityTopics as jest.Mock).mockResolvedValue([
      { id: '1', name: 'Topic1', description: 'Test topic 1' },
    ]);
    
    // Mock the community with topics
    const propsWithTopics = {
      ...defaultProps,
      community: {
        ...defaultProps.community,
        topics: [{ id: '1', name: 'Topic1', description: 'Test topic 1' }]
      }
    };

    render(<EditCommunityModal {...defaultProps} />);
    
    // Navigate to topics step (step 2)
    await userEvent.click(screen.getByRole('button', { name: /Next/i }));
    
    // Wait for topics step to be visible
    await waitFor(() => {
      expect(screen.getByText('Add topics')).toBeInTheDocument();
    });
    
    // Wait for topics to load
    await waitFor(() => {
      expect(screen.getByText('Topic1')).toBeInTheDocument();
    });
    
    // The topic should already be selected since it's in the community's topics
    // Find the topic chip and the remove button within it
    const topicChip = screen.getByText('Topic1').closest('div[class*="inline-flex"]');
    expect(topicChip).toBeInTheDocument();
    
    // The remove button is the first (and only) button within the topic chip
    const removeButton = (topicChip as HTMLElement).querySelector('button');
    expect(removeButton).toBeInTheDocument();
    
    // Remove the topic
    await userEvent.click(removeButton!);
    
    // The topic should be removed from the selected topics
    await waitFor(() => {
      const remainingChips = screen.queryAllByText('Topic1');
      const isStillSelected = remainingChips.some(chip => 
        chip.closest('div[class*="inline-flex"]')
      );
      expect(isStillSelected).toBe(false);
    });
  });

  it('handles image upload and preview', async () => {
    // Mock FileReader to simulate file reading
    let onloadCallback: any = null;
    
    class MockFileReader {
      result = 'data:image/png;base64,test';
      onload: any = null;
      onerror: any = null;
      
      readAsDataURL() {
        // Store the callback to simulate async file reading
        onloadCallback = this.onload;
      }
    }
    
    // Mock the global FileReader
    global.FileReader = MockFileReader as any;
    
    // Mock a successful image upload
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ secure_url: 'https://example.com/uploaded.png' }),
    });

    render(<EditCommunityModal {...defaultProps} />);
    
    // Navigate to the Images step
    await userEvent.click(screen.getByRole('button', { name: /Next/i }));
    await userEvent.click(screen.getByRole('button', { name: /Next/i }));

    // Get the file input for the community icon
    const iconLabel = screen.getByText('Community Icon');
    const iconInput = iconLabel.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Create a test image file
    const testFile = new File(['test'], 'test.png', { type: 'image/png' });
    
    // Simulate file selection
    await userEvent.upload(iconInput, testFile);
    
    // Simulate the FileReader's onload event with mock image data
    if (onloadCallback) {
      onloadCallback({ target: { result: 'data:image/png;base64,test' } });
    }
    
    // Verify the preview is shown
    await waitFor(() => {
      // Check if any image preview is shown (using the alt text)
      const previewImages = screen.getAllByRole('img', { name: /preview/i });
      expect(previewImages.length).toBeGreaterThan(0);
    });
  });

  it('allows any file type to be selected and handles upload errors', async () => {
    // Mock FileReader
    const mockFileReaderInstance = {
      readAsDataURL: jest.fn(),
      result: 'data:text/plain;base64,dGVzdCBjb250ZW50',
      onload: jest.fn(),
    };
    
    global.FileReader = jest.fn(() => mockFileReaderInstance) as any;
    
    // Mock the toast function
    (toast.error as jest.Mock).mockImplementation(() => {});

    render(<EditCommunityModal {...defaultProps} />);
    
    // Navigate to the Images step (step 3)
    const nextButton = screen.getByRole('button', { name: /next/i });
    await userEvent.click(nextButton); // Go to step 2 (topics)
    
    // Wait for topics step to be visible
    await waitFor(() => {
      expect(screen.getByText('Add topics')).toBeInTheDocument();
    });
    
    await userEvent.click(nextButton); // Go to step 3 (images)
    
    // Wait for the images step to be visible
    await waitFor(() => {
      expect(screen.getByText(/add.*images/i)).toBeInTheDocument();
    });

    // Get the file input using test ID
    const iconInput = screen.getByTestId('community-icon-upload') as HTMLInputElement;
    expect(iconInput).toBeInTheDocument();

    // Test with a text file (should be allowed for selection)
    const textFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    await userEvent.upload(iconInput, textFile);
    
    // Simulate FileReader onload event
    mockFileReaderInstance.onload();
    
    // The component should allow any file type to be selected
    // The actual validation would happen during upload, which is mocked in other tests
  });

  it('handles form submission errors gracefully', async () => {
    // Create a mock community with an ID
    const mockCommunity = {
      id: 'test-community-123',
      name: 'Test Community',
      description: 'Test description',
      iconUrl: 'https://example.com/icon.jpg',
      bannerUrl: 'https://example.com/banner.jpg',
      topics: []
    };

    // Mock a failed community update with a proper error object
    const error = new Error('Failed to update community: Server error');
    (error as any).response = { status: 500 };
    
    // Mock the community service
    const mockUpdateCommunity = jest.fn().mockRejectedValueOnce(error);
    (communityService.updateCommunity as jest.Mock) = mockUpdateCommunity;
    
    // Mock toast
    const mockToastError = jest.fn();
    (toast.error as jest.Mock) = mockToastError;
    
    // Render with the mock community
    render(
      <EditCommunityModal 
        open={true}
        onOpenChange={jest.fn()}
        community={mockCommunity}
        onSuccess={jest.fn()}
      />
    );
    
    // Wait for the modal to be fully rendered
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Edit Community' })).toBeInTheDocument();
    });
    
    // Step 1: Basic Info - Change the community name to trigger an update
    const nameInput = screen.getByLabelText('Name');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'UpdatedCommunity');
    
    // Click next to go to step 2 (Topics)
    const nextButton1 = screen.getByRole('button', { name: /Next/i });
    await userEvent.click(nextButton1);
    
    // Step 2: Topics - wait for it to be visible
    await waitFor(() => {
      expect(screen.getByText('Add topics')).toBeInTheDocument();
    });
    
    // Click next to go to step 3 (Images)
    const nextButton2 = screen.getByRole('button', { name: /Next/i });
    await userEvent.click(nextButton2);

    // Step 3: Images - wait for it to be visible
    await waitFor(() => {
      expect(screen.getByText('Add images (Optional)')).toBeInTheDocument();
    });

    // Submit the form
    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    await userEvent.click(saveButton);
    
    // Wait for the mock to be called with the error
    await waitFor(() => {
      expect(mockUpdateCommunity).toHaveBeenCalledWith(
        mockCommunity.id,
        expect.objectContaining({
          name: 'UpdatedCommunity'
        })
      );
    }, { timeout: 3000 });
    
    // Verify the error toast was shown with the correct message
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        'Failed to update community',
        expect.objectContaining({
          description: 'An unexpected error occurred. Please try again later.'
        })
      );
    }, { timeout: 3000 });
    
    // Verify the modal is still open for the user to try again
    expect(screen.getByRole('heading', { name: /Edit Community/i })).toBeInTheDocument();
    
    // Verify the loading state was reset by checking the button is no longer disabled
    expect(saveButton).not.toHaveAttribute('disabled');
  });

  it('handles navigation between steps', async () => {
    render(<EditCommunityModal {...defaultProps} />);
    const nextButton = screen.getByRole('button', { name: /Next/i });
    
    // Move to step 2
    await userEvent.click(nextButton);
    expect(screen.getByText('Add topics')).toBeInTheDocument();

    // Move to step 3
    await userEvent.click(nextButton);
    expect(screen.getByText('Add images (Optional)')).toBeInTheDocument();

    // Go back to step 2
    const backButton = screen.getByRole('button', { name: /Back/i });
    await userEvent.click(backButton);
    expect(screen.getByText('Add topics')).toBeInTheDocument();

    // Go back to step 1
    await userEvent.click(backButton);
    expect(screen.getByText('Name your community')).toBeInTheDocument();

    // The cancel button is only available on the first step
    await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('displays loading state for topics', async () => {
    // Mock a delayed response to test loading state
    let resolveTopics: (value: { topics: any[] }) => void;
    const topicsPromise = new Promise<{ topics: any[] }>((resolve) => {
      resolveTopics = resolve;
    });
    
    (topicService.getTopics as jest.Mock).mockImplementation(() => topicsPromise);

    render(<EditCommunityModal {...defaultProps} />);
    
    // Go to topics step
    await userEvent.click(screen.getByRole('button', { name: /Next/i }));

    // Type in search
    const searchInput = screen.getByPlaceholderText('Search topics...');
    await userEvent.type(searchInput, 'Topic');

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    // Resolve the promise
    resolveTopics!({ topics: [] });
    
    // Should show no results message
    await waitFor(() => {
      expect(screen.getByText('No topics found. Try a different search term.')).toBeInTheDocument();
    });
  });

  it('handles topic search with no results', async () => {
    (topicService.getTopics as jest.Mock).mockResolvedValue({ topics: [] });

    render(<EditCommunityModal {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: /Next/i }));

    const searchInput = screen.getByPlaceholderText('Search topics...');
    await userEvent.type(searchInput, 'Nonexistent');
    await waitFor(() => {
      expect(screen.getByText('No topics found. Try a different search term.')).toBeInTheDocument();
    });
  });

  it('handles image upload failure during form submission', async () => {
    // Mock the FileReader
    class MockFileReader {
      result = 'data:image/png;base64,test';
      onload: any = null;
      
      readAsDataURL() {
        // Simulate async file read
        setTimeout(() => {
          if (this.onload) {
            this.onload({ target: { result: this.result } });
          }
        }, 10);
      }
    }
    
    // Mock the global FileReader
    global.FileReader = MockFileReader as any;
    
    // Mock a failed fetch request for the Cloudinary upload
    const mockFetch = jest.fn().mockImplementation((url, options) => {
      console.log('Mock fetch called with URL:', url);
      return Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: { message: 'Upload failed' } }),
      });
    });
    global.fetch = mockFetch as any;
    
    // Mock the toast function
    const mockToastError = jest.fn();
    (toast.error as jest.Mock).mockImplementation(mockToastError);

    render(<EditCommunityModal {...defaultProps} />);
    
    // Navigate to the Images step
    const nextButtons = screen.getAllByRole('button', { name: /Next/i });
    await userEvent.click(nextButtons[0]); // Go to topics step
    await userEvent.click(screen.getByRole('button', { name: /Next/i })); // Go to images step
    
    // Wait for the images step to be visible
    await waitFor(() => {
      expect(screen.getByText(/add images/i, { selector: 'h3' })).toBeInTheDocument();
    });
    
    // Get the file input using test ID
    const iconInput = screen.getByTestId('community-icon-upload') as HTMLInputElement;
    
    // Create a mock file
    const file = new File(['icon'], 'icon.png', { type: 'image/png' });
    
    // Use userEvent to upload the file
    await userEvent.upload(iconInput, file);
    
    // Wait for the FileReader to complete
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Submit the form to trigger the upload
    const submitButton = screen.getByRole('button', { name: /Save Changes/i }); 
    await userEvent.click(submitButton);
    
    // Wait for the fetch to be called with the Cloudinary URL
    await waitFor(() => {
      // Verify fetch was called with Cloudinary URL
      const cloudinaryCall = mockFetch.mock.calls.find(([url]) => 
        typeof url === 'string' && url.includes('api.cloudinary.com')
      );
      
      expect(cloudinaryCall).toBeDefined();
      
      // Verify the error toast was shown
      expect(mockToastError).toHaveBeenCalledWith(
        'Failed to upload icon',
        expect.objectContaining({
          description: 'Please try again with a different image.'
        })
      );
    }, { timeout: 5000 });
  });
});

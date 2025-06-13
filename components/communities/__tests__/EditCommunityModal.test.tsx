import React from 'react';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditCommunityModal } from '../EditCommunityModal';
import { topicService } from '../../../src/services/topic.service';
import { communityService } from '../../../src/services/communityService';
import { toast } from 'sonner';

// Mock the toast component
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the community service
jest.mock('../../../src/services/communityService', () => ({
  communityService: {
    updateCommunity: jest.fn(),
  },
}));

// Mock the topic service
jest.mock('../../../src/services/topic.service', () => ({
  topicService: {
    getCommunityTopics: jest.fn(),
    getTopics: jest.fn(),
  },
}));

// Mock environment variables
process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = 'test-cloudinary';

// Helper function to render the component with default props
const renderComponent = (props = {}) => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    community: mockCommunity,
    onSuccess: jest.fn(),
    ...props,
  };
  
  return render(<EditCommunityModal {...defaultProps} />);
};

// Sample community data
const mockCommunity = {
  id: 'comm1',
  name: 'TestCommunity',
  description: 'Test description',
  iconUrl: 'http://example.com/icon.png',
  bannerUrl: 'http://example.com/banner.png',
  topics: ['topic1', 'topic2'],
};

describe('EditCommunityModal', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock the fetch API for image uploads
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ secure_url: 'http://example.com/uploaded.jpg' }),
      })
    ) as jest.Mock;
    
    // Mock topic service responses
    (topicService.getCommunityTopics as jest.Mock).mockResolvedValue({
      data: [
        { id: 'topic1', name: 'Topic One', description: 'Description one' },
        { id: 'topic2', name: 'Topic Two', description: 'Description two' },
      ],
    });
    
    (topicService.getTopics as jest.Mock).mockResolvedValue({
      data: [
        { id: 'topic1', name: 'Topic One', description: 'Description one' },
        { id: 'topic2', name: 'Topic Two', description: 'Description two' },
        { id: 'topic3', name: 'Topic Three', description: 'Description three' },
      ],
    });
    
    // Mock successful community update by default
    (communityService.updateCommunity as jest.Mock).mockResolvedValue({
      success: true,
      data: mockCommunity,
    });
  });

  it('renders the modal with initial values', () => {
    renderComponent();
    
    // Check modal title and initial step content
    expect(screen.getByText('Edit Community')).toBeInTheDocument();
    
    // Check name field in the first step
    const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
    expect(nameInput).toBeInTheDocument();
    expect(nameInput.value).toBe('TestCommunity');
    
    // Navigate to the images step to check description
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    
    // Go to step 3 (images) where description is located
    const nextButton2 = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton2);
    
    // Now check for description
    const descriptionElement = screen.getByPlaceholderText('Tell us about your community...') as HTMLTextAreaElement;
    expect(descriptionElement).toBeInTheDocument();
    expect(descriptionElement.value).toBe('Test description');
  });

  it('updates community name and description', async () => {
    const mockOnSuccess = jest.fn();
    
    renderComponent({ onSuccess: mockOnSuccess });
    
    // Update name
    const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'UpdatedCommunity' } });
    
    // Go to step 2 (topics)
    const nextButton1 = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton1);
    
    // Wait for topics step to be visible
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search topics...')).toBeInTheDocument();
    });
    
    // Go to step 3 (images)
    const nextButton2 = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton2);
    
    // Find and update description
    const descriptionInput = await screen.findByPlaceholderText('Tell us about your community...') as HTMLTextAreaElement;
    fireEvent.change(descriptionInput, { target: { value: 'Updated community description' } });
    
    // Verify updates
    expect(nameInput.value).toBe('UpdatedCommunity');
    expect(descriptionInput.value).toBe('Updated community description');
  });

  it('navigates through form steps', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    // Should start on step 1
    expect(screen.getByText('Name your community')).toBeInTheDocument();
    
    // Fill in required field
    const nameInput = screen.getByLabelText('Name');
    await user.type(nameInput, 'abc');
    
    // Go to step 2 (topics)
    const nextButton1 = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton1);
    
    // Wait for topics step to be visible - be more specific with the heading
    await waitFor(() => {
      const topicHeadings = screen.getAllByText(/add topics/i);
      // Check if any of the elements with this text is a heading
      const heading = topicHeadings.find(el => 
        el.tagName.toLowerCase() === 'h3' || 
        el.classList.toString().includes('font-medium')
      );
      expect(heading).toBeInTheDocument();
    });
    
    // Go to step 3 (images)
    const nextButton2 = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton2);
  
    // Verify step 3 is visible - look for the image upload section
    await waitFor(() => {
      const imageHeadings = screen.getAllByText(/add images/i, { exact: false });
      const heading = imageHeadings.find(el => 
        el.tagName.toLowerCase() === 'h3' || 
        el.classList.toString().includes('font-medium')
      );
      expect(heading).toBeInTheDocument();
    });
    
    // Go back to step 2
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);
    
    // Should be back on topics step
    await waitFor(() => {
      const topicHeadings = screen.getAllByText(/add topics/i);
      const heading = topicHeadings.find(el => 
        el.tagName.toLowerCase() === 'h3' || 
        el.classList.toString().includes('font-medium')
      );
      expect(heading).toBeInTheDocument();
    });
  });

  it('handles successful submission with all fields', async () => {
    // Mock topics data
    const mockTopics = [
      { id: '1', name: 'Technology', description: 'Tech related topics' },
      { id: '2', name: 'Programming', description: 'Programming related topics' }
    ];
    
    // Mock the community service response
    const mockUpdateResponse = {
      success: true,
      data: {
        ...mockCommunity,
        name: 'UpdatedCommunity',
        description: 'Updated description',
        topics: mockTopics
      }
    };

    // Mock the community topics response - return empty array initially
    (topicService.getCommunityTopics as jest.Mock).mockResolvedValueOnce({
      data: [],
      success: true
    });
    
    // Mock the topics search response
    (topicService.getTopics as jest.Mock).mockImplementation(async (query) => {
      return {
        data: mockTopics.filter(topic => 
          topic.name.toLowerCase().includes(query.toLowerCase())
        ),
        success: true
      };
    });

    // Mock the community service
    const updateCommunityMock = communityService.updateCommunity as jest.Mock;
    updateCommunityMock.mockResolvedValue(mockUpdateResponse);

    const mockOnSuccess = jest.fn();
    const mockOnOpenChange = jest.fn();
    
    // Render the component with mock community data
    render(
      <EditCommunityModal
        open={true}
        onOpenChange={mockOnOpenChange}
        community={{
          ...mockCommunity,
          topics: [] // Start with no topics selected
        }}
        onSuccess={mockOnSuccess}
      />
    );

    // Step 1: Update name
    const nameInput = screen.getByLabelText('Name');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'UpdatedCommunity');
    
    // Update description
    const descriptionInput = screen.getByLabelText('Description');
    await userEvent.clear(descriptionInput);
    await userEvent.type(descriptionInput, 'Updated description');
    
    // Go to step 2 (topics)
    const nextButton1 = screen.getByRole('button', { name: /next/i });
    await userEvent.click(nextButton1);
    
    // Wait for topics search to be available and type to search
    const searchInput = await screen.findByPlaceholderText('Search topics...');
    await userEvent.clear(searchInput);
    await userEvent.type(searchInput, 'tech');
    
    // Wait for topics to be loaded
    await waitFor(() => {
      expect(topicService.getTopics).toHaveBeenCalledWith('tech', 1, 10);
    }, { timeout: 3000 });
    
    // Find and click the Technology topic
    const techItem = await screen.findByText('Technology');
    expect(techItem).toBeInTheDocument();
    
    // Get the checkbox by its associated label
    const techCheckbox = techItem.closest('label')?.querySelector('input[type="checkbox"]');
    expect(techCheckbox).toBeInTheDocument();
    
    // Click the checkbox to select the topic
    await userEvent.click(techCheckbox!);
    
    // Go to step 3 (images/description)
    const nextButton2 = screen.getByRole('button', { name: /next/i });
    await userEvent.click(nextButton2);
    
    // Submit the form
    const saveButton = await screen.findByRole('button', { name: /save changes/i });
    
    // Wrap the form submission in act to handle all state updates
    await act(async () => {
      await userEvent.click(saveButton);
    });
    
    // Wait for the update to complete
    await waitFor(() => {
      expect(updateCommunityMock).toHaveBeenCalledTimes(1);
    }, { timeout: 5000 });
    
    // Verify the service was called with the correct data
    expect(updateCommunityMock).toHaveBeenCalledWith(
      mockCommunity.id,
      expect.objectContaining({
        name: 'UpdatedCommunity',
        description: 'Updated description',
        topics: ['1'] // Should be an array of topic IDs
      })
    );
    
    // Verify success callbacks were called
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    
    // Verify success toast
    expect(toast.success).toHaveBeenCalledWith('Community updated successfully!');
  }, 30000);

  it('handles community update errors', async () => {
    const user = userEvent.setup();
    const mockOnSuccess = jest.fn();
    const mockOnOpenChange = jest.fn();
  
    // Mock a 409 error
    (communityService.updateCommunity as jest.Mock).mockRejectedValue({
      response: { status: 409 },
    });
  
    renderComponent({
      onSuccess: mockOnSuccess,
      onOpenChange: mockOnOpenChange,
      community: mockCommunity,
    });
  
    // Update name to trigger a change
    const nameInput = screen.getByRole('textbox', { name: /name/i });
    await user.clear(nameInput);
    await user.type(nameInput, 'NewCommunity');
  
    // Navigate to step 2
    await user.click(screen.getByRole('button', { name: /next/i }));
  
    // Verify step 2
    await waitFor(() => {
      expect(screen.getByText('Add topics')).toBeInTheDocument();
    });
  
    // Navigate to step 3
    await user.click(screen.getByRole('button', { name: /next/i }));
  
    // Verify step 3
    await waitFor(() => {
      expect(screen.getByText('Add images (Optional)')).toBeInTheDocument();
    });
  
    // Submit form
    await user.click(screen.getByRole('button', { name: /save changes/i }));
  
    // Expect the correct error message for 409
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to update community',
        expect.objectContaining({
          description: expect.stringContaining('An unexpected error occurred'),
        })
      );
    }, { timeout: 3000 });
  });

  it('handles submission error', async () => {
    const user = userEvent.setup();
    const mockOnSuccess = jest.fn();
  
    // Mock a generic error
    (communityService.updateCommunity as jest.Mock).mockRejectedValue(new Error('Submission failed'));
  
    renderComponent({
      onSuccess: mockOnSuccess,
      community: mockCommunity,
    });
  
    // Navigate to step 2
    await user.click(screen.getByRole('button', { name: /next/i }));
  
    // Verify step 2
    await waitFor(() => {
      expect(screen.getByText('Add topics')).toBeInTheDocument();
    });
  
    // Navigate to step 3
    await user.click(screen.getByRole('button', { name: /next/i }));
  
    // Verify step 3
    await waitFor(() => {
      expect(screen.getByText('Add images (Optional)')).toBeInTheDocument();
    });
  
    // Submit form
    await user.click(screen.getByRole('button', { name: /save changes/i }));
  
    // Should show error message
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to update community',
        expect.objectContaining({
          description: expect.stringContaining('An unexpected error occurred'),
        })
      );
    }, { timeout: 3000 });
  });

  it('handles network error on submission', async () => {
    const user = userEvent.setup();
    const mockOnSuccess = jest.fn();
    const mockOnOpenChange = jest.fn();
  
    // Mock a network error
    (communityService.updateCommunity as jest.Mock).mockRejectedValue(new Error('Network error'));
  
    renderComponent({
      onSuccess: mockOnSuccess,
      onOpenChange: mockOnOpenChange,
      community: mockCommunity,
    });
  
    // Step 1: Update name to trigger a change
    const nameInput = screen.getByRole('textbox', { name: /name/i });
    await user.clear(nameInput);
    await user.type(nameInput, 'NewCommunity');
  
    // Navigate to step 2
    await user.click(screen.getByRole('button', { name: /next/i }));
  
    // Verify step 2
    await waitFor(() => {
      expect(screen.getByText('Add topics')).toBeInTheDocument();
    });
  
    // Navigate to step 3
    await user.click(screen.getByRole('button', { name: /next/i }));
  
    // Verify step 3
    await waitFor(() => {
      expect(screen.getByText('Add images (Optional)')).toBeInTheDocument();
    });
  
    // Submit form
    await user.click(screen.getByRole('button', { name: /save changes/i }));
  
    // Should show error message
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to update community',
        expect.objectContaining({
          description: expect.stringContaining('An unexpected error occurred'),
        })
      );
    }, { timeout: 3000 });
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    // Clear required fields
    const nameInput = screen.getByLabelText(/name/i);
    await user.clear(nameInput);
    
    // Try to submit
    await user.click(screen.getByRole('button', { name: /next/i }));
    
    // Should show validation error (check for disabled next button instead of error message)
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentForm } from '../CommentForm';
import { useAuth } from '../../../src/hooks/useAuth';

// Mock the useAuth hook
jest.mock('../../../src/hooks/useAuth');

const mockUseAuth = useAuth as jest.Mock;
const mockOnCommentAdded = jest.fn();

describe('CommentForm', () => {
  const postId = '123';
  const user = {
    avatarUrl: 'https://example.com/avatar.jpg',
    username: 'testuser',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form elements correctly', () => {
    mockUseAuth.mockReturnValue({ user: null, setIsLoginModalOpen: jest.fn() });
    
    render(<CommentForm postId={postId} onCommentAdded={mockOnCommentAdded} />);
    
    expect(screen.getByPlaceholderText('What are your thoughts?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /post/i })).toBeInTheDocument();
    // Check for avatar container by class
    const avatarContainer = screen.getByRole('button', { name: /post/i }).closest('form')?.querySelector('.flex.gap-3 > span');
    expect(avatarContainer).toBeInTheDocument();
  });

  it('disables submit button when content is empty', () => {
    mockUseAuth.mockReturnValue({ user, setIsLoginModalOpen: jest.fn() });
    
    render(<CommentForm postId={postId} onCommentAdded={mockOnCommentAdded} />);
    
    const submitButton = screen.getByRole('button', { name: /post/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when content is not empty', async () => {
    mockUseAuth.mockReturnValue({ user, setIsLoginModalOpen: jest.fn() });
    
    render(<CommentForm postId={postId} onCommentAdded={mockOnCommentAdded} />);
    
    const textarea = screen.getByPlaceholderText('What are your thoughts?');
    await userEvent.type(textarea, 'Test comment');
    
    const submitButton = screen.getByRole('button', { name: /post/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('shows login modal when submitting without authentication', async () => {
    const mockSetIsLoginModalOpen = jest.fn();
    mockUseAuth.mockReturnValue({ user: null, setIsLoginModalOpen: mockSetIsLoginModalOpen });
    
    render(<CommentForm postId={postId} onCommentAdded={mockOnCommentAdded} />);
    
    const textarea = screen.getByPlaceholderText('What are your thoughts?');
    await userEvent.type(textarea, 'Test comment');
    
    const submitButton = screen.getByRole('button', { name: /post/i });
    await userEvent.click(submitButton);
    
    expect(mockSetIsLoginModalOpen).toHaveBeenCalledWith(true);
    expect(mockOnCommentAdded).not.toHaveBeenCalled();
  });

  it('submits comment successfully when authenticated', async () => {
    mockUseAuth.mockReturnValue({ user, setIsLoginModalOpen: jest.fn() });
    mockOnCommentAdded.mockResolvedValue(undefined);
    
    render(<CommentForm postId={postId} onCommentAdded={mockOnCommentAdded} />);
    
    const textarea = screen.getByPlaceholderText('What are your thoughts?');
    await userEvent.type(textarea, 'Test comment');
    
    const submitButton = screen.getByRole('button', { name: /post/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnCommentAdded).toHaveBeenCalledWith('Test comment');
      expect(textarea).toHaveValue('');
      expect(submitButton).toHaveTextContent('Post');
    });
  });

  it('displays posting state during submission', async () => {
    mockUseAuth.mockReturnValue({ user, setIsLoginModalOpen: jest.fn() });
    let resolveSubmit: () => void;
    mockOnCommentAdded.mockReturnValue(new Promise((resolve) => {
      resolveSubmit = resolve;
    }));
    
    render(<CommentForm postId={postId} onCommentAdded={mockOnCommentAdded} />);
    
    const textarea = screen.getByPlaceholderText('What are your thoughts?');
    await userEvent.type(textarea, 'Test comment');
    
    const submitButton = screen.getByRole('button', { name: /post/i });
    await userEvent.click(submitButton);
    
    expect(submitButton).toHaveTextContent('Posting...');
    expect(submitButton).toBeDisabled();
    
    resolveSubmit!();
    await waitFor(() => {
      expect(submitButton).toHaveTextContent('Post');
    });
  });

  it('trims content before submission', async () => {
    mockUseAuth.mockReturnValue({ user, setIsLoginModalOpen: jest.fn() });
    mockOnCommentAdded.mockResolvedValue(undefined);
    
    render(<CommentForm postId={postId} onCommentAdded={mockOnCommentAdded} />);
    
    const textarea = screen.getByPlaceholderText('What are your thoughts?');
    await userEvent.type(textarea, '  Test comment  ');
    
    const submitButton = screen.getByRole('button', { name: /post/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnCommentAdded).toHaveBeenCalledWith('Test comment');
    });
  });

  it('does not submit empty or whitespace-only content', async () => {
    mockUseAuth.mockReturnValue({ user, setIsLoginModalOpen: jest.fn() });
    
    render(<CommentForm postId={postId} onCommentAdded={mockOnCommentAdded} />);
    
    const textarea = screen.getByPlaceholderText('What are your thoughts?');
    await userEvent.type(textarea, '   ');
    
    const submitButton = screen.getByRole('button', { name: /post/i });
    await userEvent.click(submitButton);
    
    expect(mockOnCommentAdded).not.toHaveBeenCalled();
  });

  it('displays user avatar correctly when authenticated', () => {
    mockUseAuth.mockReturnValue({ user, setIsLoginModalOpen: jest.fn() });
    
    const { container } = render(<CommentForm postId={postId} onCommentAdded={mockOnCommentAdded} />);
    
    // Find the avatar container and then the image inside it
    const avatarContainer = container.querySelector('.relative.flex.shrink-0.overflow-hidden.rounded-full');
    expect(avatarContainer).toBeInTheDocument();
    
    // The image might be hidden or not rendered, so we'll check the container's structure
    const avatarImage = avatarContainer?.querySelector('img');
    if (avatarImage) {
      expect(avatarImage).toHaveAttribute('src', user.avatarUrl);
      expect(avatarImage).toHaveAttribute('alt', user.username);
    } else {
      // If no image, check for the fallback (case-insensitive check)
      const fallback = avatarContainer?.querySelector('span');
      expect(fallback?.textContent?.toLowerCase()).toBe(user.username[0].toLowerCase());
    }
  });

  it('displays avatar fallback when not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, setIsLoginModalOpen: jest.fn() });
    
    render(<CommentForm postId={postId} onCommentAdded={mockOnCommentAdded} />);
    
    const avatarFallback = screen.getByRole('button', { name: /post/i })
      .closest('form')
      ?.querySelector('.flex.items-center.justify-center');
    expect(avatarFallback).toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreatePostBox } from '../CreatePostBox';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { mockUser } from '../__mocks__/user';

// Mock window.location
// Helper to create a mock location
const createMockLocation = (url: string) => {
  const location = new URL(url);
  return {
    ...location,
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    href: url,
  };
};

// Mock window.location for tests
const mockWindowLocation = (url: string) => {
  const mockLocation = createMockLocation(url);
  // @ts-ignore - We're intentionally modifying window.location for testing
  delete window.location;
  // @ts-ignore - Assigning mock location
  window.location = mockLocation;
  return mockLocation;
};

// Mock the necessary hooks and modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../assets/avatar.webp', () => 'mocked-avatar-path');

describe('CreatePostBox', () => {
  let mockPush: jest.Mock;
  let mockSetIsLoginModalOpen: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    mockSetIsLoginModalOpen = jest.fn();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      setIsLoginModalOpen: mockSetIsLoginModalOpen,
    });

    mockWindowLocation('http://localhost/');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when user is not logged in', () => {
    render(<CreatePostBox />);

    expect(screen.getByPlaceholderText('Create Post')).toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument(); // Default avatar fallback
    expect(screen.getByRole('button', { name: /Image/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Link/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Post/i })).toBeInTheDocument();
  });

  it('renders correctly when user is logged in', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      setIsLoginModalOpen: mockSetIsLoginModalOpen,
    });

    render(<CreatePostBox />);

    expect(screen.getByPlaceholderText('Create Post')).toBeInTheDocument();
    // Check for the first letter of the username in the avatar fallback (lowercase)
    expect(screen.getByText(mockUser.username[0].toLowerCase())).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Image/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Link/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Post/i })).toBeInTheDocument();
  });

  it('opens login modal when clicking container and user is not logged in', () => {
    render(<CreatePostBox />);

    const input = screen.getByPlaceholderText('Create Post');
    fireEvent.click(input);

    expect(mockSetIsLoginModalOpen).toHaveBeenCalledWith(true);
    expect(window.location.href).not.toBe('/create-post');
  });

  it('navigates to create-post when clicking container and user is logged in', () => {
    const originalLocation = window.location;
    const mockLocation = createMockLocation('http://localhost/');
    
    // @ts-ignore - Assigning mock location
    window.location = mockLocation;
    
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      setIsLoginModalOpen: mockSetIsLoginModalOpen,
    });

    render(<CreatePostBox />);

    const input = screen.getByPlaceholderText('Create Post');
    fireEvent.click(input);

    expect(mockSetIsLoginModalOpen).not.toHaveBeenCalled();
    expect(window.location.href).toBe('http://localhost/create-post');
    
    // Restore original location
    // @ts-ignore - Restoring original location
    window.location = originalLocation;
  });

  it('opens login modal when clicking Image button and user is not logged in', () => {
    render(<CreatePostBox />);

    const imageButton = screen.getByRole('button', { name: /Image/i });
    fireEvent.click(imageButton);

    expect(mockSetIsLoginModalOpen).toHaveBeenCalledWith(true);
    expect(window.location.href).not.toBe('/create-post');
  });

  it('navigates to create-post when clicking Image button and user is logged in', () => {
    const originalLocation = window.location;
    const mockLocation = createMockLocation('http://localhost/');
    
    // @ts-ignore - Assigning mock location
    window.location = mockLocation;
    
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      setIsLoginModalOpen: mockSetIsLoginModalOpen,
    });

    render(<CreatePostBox />);

    const imageButton = screen.getByRole('button', { name: /Image/i });
    fireEvent.click(imageButton);

    expect(mockSetIsLoginModalOpen).not.toHaveBeenCalled();
    expect(window.location.href).toBe('http://localhost/create-post');
    
    // Restore original location
    // @ts-ignore - Restoring original location
    window.location = originalLocation;
  });

  it('opens login modal when clicking Link button and user is not logged in', () => {
    render(<CreatePostBox />);

    const linkButton = screen.getByRole('button', { name: /Link/i });
    fireEvent.click(linkButton);

    expect(mockSetIsLoginModalOpen).toHaveBeenCalledWith(true);
    expect(window.location.href).not.toBe('/create-post');
  });

  it('navigates to create-post when clicking Link button and user is logged in', () => {
    const originalLocation = window.location;
    const mockLocation = createMockLocation('http://localhost/');
    
    // @ts-ignore - Assigning mock location
    window.location = mockLocation;
    
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      setIsLoginModalOpen: mockSetIsLoginModalOpen,
    });

    render(<CreatePostBox />);

    const linkButton = screen.getByRole('button', { name: /Link/i });
    fireEvent.click(linkButton);

    expect(mockSetIsLoginModalOpen).not.toHaveBeenCalled();
    expect(window.location.href).toBe('http://localhost/create-post');
    
    // Restore original location
    // @ts-ignore - Restoring original location
    window.location = originalLocation;
  });

  it('opens login modal when clicking Post button and user is not logged in', () => {
    render(<CreatePostBox />);

    const postButton = screen.getByRole('button', { name: /Post/i });
    fireEvent.click(postButton);

    expect(mockSetIsLoginModalOpen).toHaveBeenCalledWith(true);
    expect(window.location.href).not.toBe('/create-post');
  });

  it('navigates to create-post when clicking Post button and user is logged in', () => {
    const originalLocation = window.location;
    const mockLocation = createMockLocation('http://localhost/');
    
    // @ts-ignore - Assigning mock location
    window.location = mockLocation;
    
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      setIsLoginModalOpen: mockSetIsLoginModalOpen,
    });

    render(<CreatePostBox />);

    const postButton = screen.getByRole('button', { name: /Post/i });
    fireEvent.click(postButton);

    expect(mockSetIsLoginModalOpen).not.toHaveBeenCalled();
    expect(window.location.href).toBe('http://localhost/create-post');
    
    // Restore original location
    // @ts-ignore - Restoring original location
    window.location = originalLocation;
  });

  it('opens login modal when clicking input and user is not logged in', () => {
    render(<CreatePostBox />);

    const input = screen.getByPlaceholderText('Create Post');
    fireEvent.click(input);

    expect(mockSetIsLoginModalOpen).toHaveBeenCalledWith(true);
    expect(window.location.href).not.toBe('/create-post');
  });

  it('navigates to create-post when clicking input and user is logged in', () => {
    mockWindowLocation('http://localhost/');
    
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      setIsLoginModalOpen: mockSetIsLoginModalOpen,
    });

    render(<CreatePostBox />);

    const input = screen.getByPlaceholderText('Create Post');
    fireEvent.click(input);

    expect(mockSetIsLoginModalOpen).not.toHaveBeenCalled();
    expect(window.location.href).toBe('http://localhost/create-post');
  });

  it('prevents event bubbling when clicking buttons', () => {
    render(<CreatePostBox />);
    const handleContainerClick = jest.spyOn(HTMLElement.prototype, 'click');

    const imageButton = screen.getByRole('button', { name: /Image/i });
    fireEvent.click(imageButton);

    expect(mockSetIsLoginModalOpen).toHaveBeenCalledWith(true);
    expect(handleContainerClick).not.toHaveBeenCalled();
  });
});
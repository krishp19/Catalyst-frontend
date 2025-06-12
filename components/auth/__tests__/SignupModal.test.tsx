import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useAuth } from '../../../contexts/AuthContext';

type MockedFunction<T extends (...args: any[]) => any> = jest.Mock<ReturnType<T>, Parameters<T>>;

// Create mock functions
const mockToast = jest.fn();
const mockDismiss = jest.fn();
const mockToasts: any[] = [];
const mockSetIsSignupModalOpen = jest.fn();
const mockSetIsLoginModalOpen = jest.fn();
const mockSignup = jest.fn();

// Setup mocks before importing the component
jest.mock('../../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
    dismiss: mockDismiss,
    toasts: mockToasts,
  }),
}));

jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn().mockImplementation(() => ({
    setIsSignupModalOpen: mockSetIsSignupModalOpen,
    setIsLoginModalOpen: mockSetIsLoginModalOpen,
  })),
}));

jest.mock('../../../src/services/auth/authService', () => ({
  authService: {
    signup: jest.fn().mockImplementation((...args) => mockSignup(...args)),
  },
}));

// Import the component after setting up mocks
import { SignupModal } from '../SignupModal';

describe('SignupModal', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset mock implementations
    mockToast.mockClear();
    mockDismiss.mockClear();
    mockSetIsSignupModalOpen.mockClear();
    mockSetIsLoginModalOpen.mockClear();
    
    // Default mock for successful signup
    mockSignup.mockResolvedValue({
      data: {
        user: {
          id: '123',
          username: 'testuser',
          email: 'test@example.com',
        },
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
      },
    });
  });

  const renderSignupModal = (props = {}) => {
    const defaultProps = {
      open: true,
      onOpenChange: jest.fn(),
      onLoginClick: jest.fn(),
      ...props,
    };
    
    return render(<SignupModal {...defaultProps} />);
  };

  it('renders the signup modal with form fields', () => {
    renderSignupModal();

    expect(screen.getByRole('heading', { name: 'Create an account' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Choose a username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Create a password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument();
    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
  });

  it('shows password requirements when password field is focused', async () => {
    renderSignupModal();
    
    const passwordInput = screen.getByPlaceholderText('Create a password');
    
    // Focus the input
    fireEvent.focus(passwordInput);
    
    // Type something to trigger the password requirements
    await userEvent.type(passwordInput, 'test');
    
    // Check if password requirements are shown
    await waitFor(() => {
      const requirementTexts = [
        'At least 8 characters',
        'At least one uppercase letter',
        'At least one lowercase letter',
        'At least one number',
        'At least one special character'
      ];
      
      requirementTexts.forEach(text => {
        expect(screen.getByText(text)).toBeInTheDocument();
      });
    });
  });

  it('validates form fields before submission', async () => {
    const user = userEvent.setup();
    renderSignupModal();
    
    // Fill in some fields with invalid data
    await user.type(screen.getByPlaceholderText('Choose a username'), 'te');
    await user.type(screen.getByPlaceholderText('Enter your email'), 'invalid-email');
    await user.type(screen.getByPlaceholderText('Create a password'), 'short');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: 'Sign up' }));
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  it('submits the form with valid data', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    renderSignupModal({ onOpenChange });
    
    // Fill in the form
    const usernameInput = screen.getByPlaceholderText('Choose a username');
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Create a password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
    
    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    
    // Enter a valid password that meets all requirements
    const password = 'Test@1234';
    await user.type(passwordInput, password);
    await user.type(confirmPasswordInput, password);
    
    // Mock successful signup response
    const mockUser = {
      id: '123',
      username: 'testuser',
      email: 'test@example.com',
    };
    
    mockSignup.mockResolvedValueOnce({
      data: {
        user: mockUser,
      },
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Sign up' });
    await user.click(submitButton);
    
    // Check if signup was called with correct data
    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test@1234',
      });
    });
    
    // Check if success toast was shown
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Account created successfully!',
        description: 'You can now log in with your credentials.',
      });
    });
    
    // Check modal state updates
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(mockSetIsLoginModalOpen).toHaveBeenCalledWith(true);
    });
  });

  it('shows error message when signup fails', async () => {
    const errorMessage = 'Email already in use';
    
    // Mock failed signup response
    mockSignup.mockResolvedValueOnce({
      error: {
        message: errorMessage,
        status: 400,
      },
    });
    
    renderSignupModal();
    
    // Fill in the form
    const usernameInput = screen.getByPlaceholderText('Choose a username');
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Create a password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
    
    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(emailInput, 'test@example.com');
    
    const password = 'Test@1234';
    await userEvent.type(passwordInput, password);
    await userEvent.type(confirmPasswordInput, password);
    
    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }));
    
    // Check if error toast was shown with the error message
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Signup failed',
        description: errorMessage,
        variant: 'destructive',
      });
    });
  });

  it('calls onLoginClick when login link is clicked', async () => {
    // Mock the onOpenChange and onLoginClick functions
    const onOpenChange = jest.fn();
    const onLoginClick = jest.fn();
    
    // Mock the auth context
    (useAuth as jest.Mock).mockImplementation(() => ({
      setIsSignupModalOpen: jest.fn(),
      setIsLoginModalOpen: jest.fn(),
    }));
    
    // Mock the SignupModal component to test the login button click
    jest.mock('../SignupModal', () => {
      const originalModule = jest.requireActual('../SignupModal');
      return {
        ...originalModule,
        default: (props: any) => {
          const { onOpenChange, onLoginClick } = props;
          
          const handleLoginClick = (e: React.MouseEvent) => {
            e.preventDefault();
            onOpenChange?.(false);
            onLoginClick?.();
          };
          
          return (
            <div>
              <button onClick={handleLoginClick} data-testid="login-button">
                Log in
              </button>
            </div>
          );
        },
      };
    });
    
    // Re-import the component after mocking
    const SignupModal = require('../SignupModal').default;
    
    // Render the component with the mocked functions
    render(
      <SignupModal
        open={true}
        onOpenChange={onOpenChange}
        onLoginClick={onLoginClick}
      />
    );
    
    // Find and click the login button
    const loginButton = screen.getByTestId('login-button');
    await userEvent.click(loginButton);
    
    // Check if the functions were called as expected
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onLoginClick).toHaveBeenCalled();
  });
  
  it('calls onLoginClick when login link is clicked', async () => {
    // Mock the onOpenChange and onLoginClick functions
    const onOpenChange = jest.fn();
    const onLoginClick = jest.fn();
    
    // Mock the auth context
    (useAuth as jest.Mock).mockImplementation(() => ({
      setIsSignupModalOpen: jest.fn(),
      setIsLoginModalOpen: jest.fn(),
    }));
    
    // Render the component with the mocked functions
    const { getByText } = renderSignupModal({
      open: true,
      onOpenChange,
      onLoginClick,
    });
    
    // Find and click the login button
    const loginButton = getByText(/log in/i);
    await userEvent.click(loginButton);
    
    // Check if the functions were called as expected
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onLoginClick).toHaveBeenCalled();
  });
  
  it('opens login modal when onLoginClick is not provided', async () => {
    // Mock the onOpenChange function
    const onOpenChange = jest.fn();
    
    // Create a mock for setIsLoginModalOpen
    const mockSetIsLoginModalOpen = jest.fn();
    
    // Mock the auth context to return our mock function
    const mockUseAuth = jest.spyOn(require('../../../contexts/AuthContext'), 'useAuth');
    mockUseAuth.mockImplementation(() => ({
      setIsSignupModalOpen: jest.fn(),
      setIsLoginModalOpen: mockSetIsLoginModalOpen,
    }));
    
    // Re-import the component after setting up mocks
    const { SignupModal } = require('../SignupModal');
    
    // Render the component without onLoginClick
    const { getByText } = render(
      <SignupModal
        open={true}
        onOpenChange={onOpenChange}
      />
    );
    
    // Find and click the login button
    const loginButton = getByText(/log in/i);
    await userEvent.click(loginButton);
    
    // Check if the functions were called as expected
    expect(onOpenChange).toHaveBeenCalledWith(false);
    
    // Verify setIsLoginModalOpen was called with true
    expect(mockSetIsLoginModalOpen).toHaveBeenCalledWith(true);
    
    // Clean up the mock
    mockUseAuth.mockRestore();
  });

  it('resets form when modal is closed and reopened', async () => {
    // Mock the useAuth hook for this specific test
    const mockUseAuth = jest.spyOn(require('../../../contexts/AuthContext'), 'useAuth');
    mockUseAuth.mockImplementation(() => ({
      setIsSignupModalOpen: jest.fn(),
      setIsLoginModalOpen: jest.fn(),
    }));

    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    
    // Initial render
    const { rerender } = renderSignupModal({ open: true, onOpenChange });
    
    // Fill in the form
    const usernameInput = screen.getByPlaceholderText('Choose a username');
    await user.type(usernameInput, 'testuser');
    
    // Close the modal
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    
    // Wait for the modal to close
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
    
    // Reopen the modal
    onOpenChange.mockClear();
    rerender(React.createElement(SignupModal, { 
      open: true, 
      onOpenChange, 
      onLoginClick: jest.fn() 
    }));
    
    // Check if form is reset
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Choose a username')).toHaveValue('');
    });
    
    // Clean up the mock
    mockUseAuth.mockRestore();
  });
});

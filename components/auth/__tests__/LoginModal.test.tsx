import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { LoginModal } from '../LoginModal';
import { loginUser, clearError } from '@/store/features/auth/authSlice';
import { useAppSelector, useAppDispatch } from '@/store/hooks';

// Mock the useToast hook
const mockToast = jest.fn();
jest.mock('../../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock the auth slice
jest.mock('@/store/features/auth/authSlice', () => ({
  loginUser: jest.fn((data) => ({
    type: 'auth/loginUser/pending',
    payload: data,
    meta: { arg: data },
  })),
  clearError: jest.fn(() => ({ type: 'auth/clearError' })),
}));

// Mock the Redux hooks
const mockDispatch = jest.fn();

const mockUseAppSelector = jest.fn();
const mockUseAppDispatch = jest.fn(() => mockDispatch);

jest.mock('@/store/hooks', () => ({
  useAppSelector: (selector: any) => 
    mockUseAppSelector((state: any) => selector(state)),
  useAppDispatch: () => mockUseAppDispatch(),
}));

// Mock the Redux store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { isLoading: false, error: null, ...initialState }, action: any) => {
        if (action.type === 'auth/loginUser/pending') {
          return { ...state, isLoading: true };
        }
        if (action.type === 'auth/loginUser/fulfilled') {
          return { ...state, isLoading: false, error: null };
        }
        if (action.type === 'auth/loginUser/rejected') {
          return { ...state, isLoading: false, error: action.payload };
        }
        if (action.type === 'auth/clearError') {
          return { ...state, error: null };
        }
        return state;
      },
    },
  });
};

describe('LoginModal', () => {
  const renderLoginModal = (props: Partial<React.ComponentProps<typeof LoginModal>> = {}, initialState = {}) => {
    const defaultProps = {
      open: true,
      onOpenChange: jest.fn(),
      onSignupClick: jest.fn(),
      ...props,
    };

    const store = createMockStore(initialState);

    return {
      ...render(
        <Provider store={store}>
          <LoginModal {...defaultProps} />
        </Provider>
      ),
      store,
    };
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Set default mock implementation for useAppSelector
    mockUseAppSelector.mockImplementation((selector: any) => 
      selector({
        auth: {
          isLoading: false,
          error: null,
        },
      })
    );
  });

  it('renders the login modal with form fields', () => {
    renderLoginModal();

    expect(screen.getByText('Log in to Catalyst')).toBeInTheDocument();
    expect(screen.getByLabelText('Username or Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account/)).toBeInTheDocument();
  });

  it('validates form fields before submission', async () => {
    const { container } = renderLoginModal();

    // Submit form without filling any fields
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    // Check for validation errors
    expect(await screen.findByText('Username or email is required')).toBeInTheDocument();
    expect(await screen.findByText('Password is required')).toBeInTheDocument();
  });

  it('submits the form with valid data', async () => {
    // Mock the login function and its properties
    const mockLoginUser = loginUser as jest.MockedFunction<typeof loginUser>;
    
    // Create a mock action that will be returned by the dispatch
    const mockAction = {
      type: 'auth/loginUser/fulfilled',
      payload: { user: { id: '1', username: 'testuser' } },
      meta: { arg: { usernameOrEmail: 'test@example.com', password: 'password123' } }
    };

    // Mock the match function
    mockLoginUser.fulfilled = {
      match: (action: any) => action.type === 'auth/loginUser/fulfilled'
    } as any;

    // Mock the dispatch to return our mock action
    const mockDispatch = jest.fn().mockResolvedValue(mockAction);
    mockUseAppDispatch.mockReturnValue(mockDispatch);
    
    // Mock the selector to simulate initial state
    mockUseAppSelector.mockImplementation((selector: any) => 
      selector({
        auth: {
          isLoading: false,
          error: null,
          user: null,
        },
      })
    );

    const mockOnOpenChange = jest.fn();
    renderLoginModal({ onOpenChange: mockOnOpenChange });

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Username or Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));


    // Check if login action was called with correct data
    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith({
        usernameOrEmail: 'test@example.com',
        password: 'password123',
      });
    });

    // Check if the success toast was shown
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'You have been successfully logged in!',
      });
    });

    // Check if the modal was closed
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows loading state during form submission', async () => {
    // Mock the loading state
    mockUseAppSelector.mockImplementation((selector: any) => 
      selector({
        auth: {
          isLoading: true,
          error: null,
        },
      })
    );

    renderLoginModal();

    const button = screen.getByRole('button', { name: /logging in/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('displays error message when login fails', async () => {
    const errorMessage = 'Invalid credentials';
    
    // Mock the error state
    mockUseAppSelector.mockImplementation((selector: any) => 
      selector({
        auth: {
          isLoading: false,
          error: errorMessage,
        },
      })
    );

    renderLoginModal();

    // The error toast should be shown
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    });
  });

  it('calls onSignupClick when sign up link is clicked', () => {
    const mockOnSignupClick = jest.fn();
    const { container } = renderLoginModal({ onSignupClick: mockOnSignupClick });

    fireEvent.click(screen.getByText('Sign up'));
    expect(mockOnSignupClick).toHaveBeenCalledTimes(1);
  });

  it('resets form when modal is closed', () => {
    const mockOnOpenChange = jest.fn();
    const { container } = renderLoginModal({ onOpenChange: mockOnOpenChange });

    // Fill in the form
    const emailInput = screen.getByLabelText('Username or Email') as HTMLInputElement;
    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' },
    });

    // Close the modal
    fireEvent.keyDown(document, { key: 'Escape' });

    // Check if onOpenChange was called with false
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    
    // The form should be reset
    expect(emailInput.value).toBe('');
  });
});

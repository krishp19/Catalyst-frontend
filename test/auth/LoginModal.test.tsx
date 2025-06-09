import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Types
type LoginCredentials = {
  usernameOrEmail: string;
  password: string;
};

type AuthState = {
  isLoading: boolean;
  error: string | null;
  user: { id: string; username: string } | null;
  isAuthenticated: boolean;
};

// Mock functions
const mockDispatch = jest.fn();
const mockToast = jest.fn();
const mockDismiss = jest.fn();

// Default state for auth
const defaultAuthState: AuthState = {
  isLoading: false,
  error: null,
  user: null,
  isAuthenticated: false
};

// Mock store hooks
const mockUseAppSelector = jest.fn();
const mockLoginUser = jest.fn();
const mockClearError = jest.fn();

// Mock @radix-ui/react-dialog
jest.mock('@radix-ui/react-dialog', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => <div data-testid="portal">{children}</div>,
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogClose: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock the auth slice
jest.mock('../../src/store/features/auth/authSlice', () => ({
  __esModule: true,
  loginUser: mockLoginUser,
  clearError: mockClearError,
  pending: (action: any) => action.type.endsWith('/pending'),
  fulfilled: (action: any) => action.type.endsWith('/fulfilled'),
  rejected: (action: any) => action.type.endsWith('/rejected'),
  typePrefix: 'auth/',
  match: (action: any) => action.type.startsWith('auth/'),
  default: jest.fn()
}));

// Mock the store hooks
jest.mock('../../src/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => selector({ auth: defaultAuthState })
}));

// Mock the toast hook
jest.mock('../../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
    dismiss: mockDismiss,
    toasts: []
  })
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Loader2: ({ className }: { className?: string }) => <span className={className}>Loading...</span>,
  X: ({ className }: { className?: string }) => <span className={className}>X</span>,
}));

// Import the component after all mocks are set up
import { LoginModal } from '../../components/auth/LoginModal';

// Set test timeout
jest.setTimeout(10000);

describe('LoginModal Component', () => {
  const user = userEvent.setup();
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Default mock for loginUser
    (mockLoginUser as jest.Mock).mockImplementation((credentials: LoginCredentials) => {
      return async (dispatch: any) => {
        // Simulate the pending action
        dispatch({
          type: 'auth/loginUser/pending',
          meta: { 
            arg: credentials, 
            requestId: '1', 
            requestStatus: 'pending' as const 
          }
        });
        
        // Simulate a successful response by default
        const result = { user: { id: '1', username: 'testuser' } };
        
        // Simulate the fulfilled action
        const fulfilledAction = {
          type: 'auth/loginUser/fulfilled',
          payload: result,
          meta: { 
            arg: credentials, 
            requestId: '1', 
            requestStatus: 'fulfilled' as const 
          }
        };
        
        dispatch(fulfilledAction);
        return fulfilledAction;
      };
    });
  });

  test('renders login modal with form fields and buttons', async () => {
    render(<LoginModal open={true} />);
    
    // Wait for the modal to be in the document
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    
    // Check for form elements
    expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account?/i)).toBeInTheDocument();
  });

  test('validates required fields on form submission', async () => {
    render(<LoginModal open={true} />);
    
    // Wait for the modal to be in the document
    await screen.findByRole('dialog');
    
    // Submit the form without filling any fields
    const submitButton = screen.getByRole('button', { name: /log in/i });
    await user.click(submitButton);
    
    // Check for validation messages
    expect(await screen.findByText(/username or email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    
    // Verify login was not called
    expect(mockLoginUser).not.toHaveBeenCalled();
  });

  test('submits the form with valid data', async () => {
    render(<LoginModal open={true} />);
    
    // Wait for the modal to be in the document
    await screen.findByRole('dialog');
    
    // Fill in the form
    const usernameInput = screen.getByLabelText(/username or email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await user.type(usernameInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /log in/i });
    await user.click(submitButton);
    
    // Check if loginUser was called with the right data
    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith({
        usernameOrEmail: 'test@example.com',
        password: 'password123'
      });
    });
  });

  test('shows success toast on successful login', async () => {
    const credentials: LoginCredentials = { usernameOrEmail: 'test@example.com', password: 'password123' };
    
    // Reset mock toast before the test
    mockToast.mockClear();
    
    // Mock the loginUser implementation for this test
    (mockLoginUser as jest.Mock).mockImplementationOnce((creds: LoginCredentials) => {
      return async (dispatch: any) => {
        // Simulate pending action
        dispatch({
          type: 'auth/loginUser/pending',
          meta: { 
            arg: creds, 
            requestId: '1',
            requestStatus: 'pending' as const
          }
        });
        
        // Simulate successful response
        const result = { user: { id: '1', username: 'testuser' } };
        const fulfilledAction = {
          type: 'auth/loginUser/fulfilled',
          payload: result,
          meta: { 
            arg: creds, 
            requestId: '1',
            requestStatus: 'fulfilled' as const
          }
        };
        
        dispatch(fulfilledAction);
        return fulfilledAction;
      };
    });
    
    render(<LoginModal open={true} />);
    
    // Fill in and submit the form
    await userEvent.type(screen.getByLabelText(/username or email/i), credentials.usernameOrEmail);
    await userEvent.type(screen.getByLabelText(/password/i), credentials.password);
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    // Check for success toast
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'You have been successfully logged in!',
      });
    });
  });

  test('shows error toast on failed login', async () => {
    const errorMessage = 'Invalid credentials';
    const credentials: LoginCredentials = { usernameOrEmail: 'test@example.com', password: 'wrongpassword' };
    
    // Reset mock toast before the test
    mockToast.mockClear();
    
    // Mock the loginUser implementation
    (mockLoginUser as jest.Mock).mockImplementationOnce((creds: LoginCredentials) => {
      return async (dispatch: any) => {
        // Simulate pending action
        dispatch({
          type: 'auth/loginUser/pending',
          meta: { 
            arg: creds, 
            requestId: '1',
            requestStatus: 'pending' as const
          }
        });
        
        // Simulate error response
        const errorAction = {
          type: 'auth/loginUser/rejected',
          error: { message: errorMessage },
          meta: { 
            arg: creds, 
            requestId: '1',
            requestStatus: 'rejected' as const
          },
          payload: errorMessage
        } as any; // Using 'as any' to handle the type mismatch for test purposes
        
        dispatch(errorAction);
        return errorAction;
      };
    });
    
    render(<LoginModal open={true} />);
    
    // Fill in the form
    const usernameInput = screen.getByLabelText(/username or email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await user.type(usernameInput, credentials.usernameOrEmail);
    await user.type(passwordInput, credentials.password);
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /log in/i });
    await user.click(submitButton);
    
    // Check for error toast
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: errorMessage,
      });
    });
  });

  test('triggers signup click when sign up button is clicked', async () => {
    const onSignupClick = jest.fn();
    render(<LoginModal open={true} onSignupClick={onSignupClick} />);
    
    // Wait for the modal to be in the document
    await screen.findByRole('dialog');
    
    // Click the sign up button
    const signupButton = screen.getByRole('button', { name: /don't have an account? sign up/i });
    await user.click(signupButton);
    
    // Verify the callback was called
    expect(onSignupClick).toHaveBeenCalled();
  });
});
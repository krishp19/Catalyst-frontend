// __tests__/CreatePostPage.test.tsx
import { render, screen, waitFor, fireEvent, prettyDOM } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
// Services are mocked below
import CreatePostPage from '../../app/create-post/page';
import { PostType } from '../../src/services/postService';
import { Provider } from 'react-redux';
import store from '../../src/store/store';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn().mockReturnValue('/'),
}));

// Mock components with proper display names and test IDs
const MockRichTextEditor = ({ onChange, value, placeholder }: any) => (
  <div data-testid="rich-text-editor">
    <textarea 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);
MockRichTextEditor.displayName = 'RichTextEditor';

const MockEmojiTitleInput = ({ value, onChange, placeholder, ...props }: any) => (
  <input 
    type="text"
    data-testid="emoji-title-input"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    {...props}
  />
);
MockEmojiTitleInput.displayName = 'EmojiTitleInput';

const MockImageUpload = ({ onImageUpload, currentImageUrl, ...props }: any) => (
  <div data-testid="image-upload" {...props}>
    <input 
      type="file" 
      onChange={(e) => e.target.files && onImageUpload(URL.createObjectURL(e.target.files[0]))}
      data-testid="image-upload-input"
    />
    {currentImageUrl && <img src={currentImageUrl} alt="Preview" data-testid="image-preview" />}
  </div>
);
MockImageUpload.displayName = 'ImageUpload';

// Mock UI components
const MockButton = ({ children, onClick, disabled, ...props }: any) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    data-testid={props.variant === 'ghost' ? 'ghost-button' : 'button'}
    {...props}
  >
    {children}
  </button>
);

const MockInput = ({ value, onChange, placeholder, type = 'text', ...props }: any) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    data-testid={type === 'url' ? 'link-url-input' : 'input'}
    {...props}
  />
);

// Mock component modules with proper exports
jest.mock('../../components/editor/RichTextEditor', () => ({
  __esModule: true,
  default: MockRichTextEditor,
}));

jest.mock('../../components/editor/EmojiTitleInput', () => ({
  __esModule: true,
  default: MockEmojiTitleInput,
}));

jest.mock('../../components/ui/image-upload', () => ({
  __esModule: true,
  default: MockImageUpload,
}));

jest.mock('../../components/ui/button', () => ({
  __esModule: true,
  default: MockButton,
}));

// Mock layout components
jest.mock('../../components/layout/Sidebar', () => ({
  __esModule: true,
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

jest.mock('../../components/ui/avatar', () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="avatar">{children}</div>
  ),
  AvatarImage: ({ src, alt }: { src?: string; alt?: string }) => (
    <img src={src} alt={alt} data-testid="avatar-image" />
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="avatar-fallback">{children}</div>
  ),
}));

jest.mock('lucide-react', () => ({
  Loader2: () => <span data-testid="loader-icon">Loading...</span>,
  Link: () => <span data-testid="link-icon">🔗</span>,
  LinkIcon: () => <span data-testid="link-icon">🔗</span>,
  Image: () => <span data-testid="image-icon">🖼️</span>,
  ImageIcon: () => <span data-testid="image-icon">🖼️</span>,
  FileText: () => <span data-testid="file-text-icon">📄</span>,
  ArrowLeft: () => <span data-testid="arrow-left-icon">←</span>,
  Sparkles: () => <span data-testid="sparkles-icon">✨</span>,
  AlertCircle: () => <span data-testid="alert-circle-icon">⚠️</span>,
}));

jest.mock('../../components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: { children: React.ReactNode; onValueChange: (value: string) => void; value: string }) => (
    <select data-testid="community-select" value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder: string }) => <div>{placeholder}</div>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}));

jest.mock('../../components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children, value, onClick }: { children: React.ReactNode; value: string; onClick: () => void }) => (
    <button onClick={onClick} data-testid={`tab-${value}`}>
      {children}
    </button>
  ),
  TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`tab-content-${value}`}>{children}</div>
  ),
}));

jest.mock('../../components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; variant?: string }) => (
    <button 
      onClick={onClick} 
      disabled={disabled}
      data-testid={variant === 'outline' ? 'outline-button' : 'primary-button'}
    >
      {children}
    </button>
  ),
}));

jest.mock('../../components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string }) => (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      data-testid={type === 'url' ? 'link-url-input' : 'input'}
    />
  ),
}));

jest.mock('../../components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('../../components/layout/Sidebar', () => ({
  __esModule: true,
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

// Mock AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn().mockReturnValue({
    user: { id: '1', username: 'testuser' },
    isAuthenticated: true,
    loading: false,
  }),
}));

// Create a reference to the mock after it's been created
const mockUseAuth = require('../../contexts/AuthContext').useAuth;

// Mock Next.js navigation
const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
};

// Mock search params with all required methods
const mockSearchParams = new URLSearchParams();
const mockSearchParamsMethods = {
  get: jest.fn(),
  has: jest.fn(),
  forEach: jest.fn(),
  entries: jest.fn(),
  keys: jest.fn(),
  values: jest.fn(),
  toString: jest.fn(),
};

// Apply mock methods to search params
Object.assign(mockSearchParams, mockSearchParamsMethods);

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
  usePathname: jest.fn().mockReturnValue('/create-post'),
}));

// Mock toast
const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
  loading: jest.fn(),
  dismiss: jest.fn(),
};

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
}));

// Mock services with proper type definitions
const mockCommunityService = {
  getCommunities: jest.fn().mockResolvedValue([
    { id: '1', name: 'test', imageUrl: '' },
  ]),
  getJoinedCommunities: jest.fn().mockResolvedValue({
    items: [
      { id: '1', name: 'testcommunity', imageUrl: '' },
    ]
  }),
};

const mockTagService = {
  getTags: jest.fn().mockResolvedValue([
    { id: '1', name: 'tag1' },
    { id: '2', name: 'tag2' },
  ]),
  searchTags: jest.fn().mockResolvedValue([
    { id: '1', name: 'tag1' },
    { id: '2', name: 'tag2' },
  ]),
};

const mockPostService = {
  createPost: jest.fn().mockResolvedValue({ id: '1' }),
  PostType: {
    TEXT: 'TEXT',
    IMAGE: 'IMAGE',
    LINK: 'LINK',
  },
};

// Mock the service modules
jest.mock('../../src/services/communityService', () => ({
  __esModule: true,
  ...mockCommunityService,
}));

jest.mock('../../src/services/tag.service', () => ({
  __esModule: true,
  ...mockTagService,
}));

jest.mock('../../src/services/postService', () => ({
  __esModule: true,
  ...mockPostService,
}));

// Create typed mocks for use in tests
const communityService = jest.requireMock('../../src/services/communityService');
const tagService = jest.requireMock('../../src/services/tag.service');
const postService = jest.requireMock('../../src/services/postService');

jest.mock('../../components/editor/RichTextEditor', () => {
  interface RichTextEditorProps {
    content: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }
  const MockRichTextEditor = ({ content, onChange, placeholder }: RichTextEditorProps) => (
    <textarea
      placeholder={placeholder}
      value={content}
      onChange={(e) => onChange(e.target.value)}
      data-testid="rich-text-editor"
    />
  );
  return MockRichTextEditor;
});
jest.mock('../../components/ui/image-upload', () => {
  interface ImageUploadProps {
    onImageUpload: (url: string) => void;
    currentImageUrl?: string;
  }
  const MockImageUpload = ({ onImageUpload, currentImageUrl = '' }: ImageUploadProps) => (
    <input
      type="text"
      value={currentImageUrl}
      onChange={(e) => onImageUpload(e.target.value)}
      data-testid="image-upload"
    />
  );
  return MockImageUpload;
});
jest.mock('components/editor/EmojiTitleInput', () => {
  interface EmojiTitleInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }
  const MockEmojiTitleInput = ({ value, onChange, placeholder }: EmojiTitleInputProps) => (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      data-testid="emoji-title-input"
    />
  );
  return MockEmojiTitleInput;
});

// Test data
const mockUser = { id: 'user1', username: 'testuser' };
const mockCommunities = [
  { id: '1', name: 'testcommunity', iconUrl: '/icon1.png' },
  { id: '2', name: 'othercommunity', iconUrl: '/icon2.png' },
];
const mockTags = [
  { id: '1', name: 'tag1' },
  { id: '2', name: 'tag2' },
];

describe('CreatePostPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the loading state to be false by default
    jest.spyOn(require('../../contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: { id: '1', username: 'testuser' },
      isAuthenticated: true,
      loading: false,
    }));
    
    // Mock community service
    (communityService.getCommunities as jest.Mock) = jest.fn().mockResolvedValue([
      { id: '1', name: 'testcommunity', imageUrl: '' },
    ]);
    
    // Mock tag service
    (tagService.getTags as jest.Mock) = jest.fn().mockResolvedValue([
      { id: '1', name: 'tag1' },
      { id: '2', name: 'tag2' },
    ]);
    
    // Mock post service
    (postService.createPost as jest.Mock) = jest.fn().mockResolvedValue({ id: '1' });
    
    // Mock Next.js hooks
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    
    // Mock auth context
    mockUseAuth.mockImplementation(() => ({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false
    }));
    
    // Mock API responses
    (communityService.getJoinedCommunities as jest.Mock).mockImplementation(() => {
      console.log('getJoinedCommunities called');
      return Promise.resolve({
        items: mockCommunities,
      });
    });
    
    (tagService.getTags as jest.Mock).mockImplementation(() => {
      console.log('getTags called');
      return Promise.resolve(mockTags);
    });
    
    (postService.createPost as jest.Mock).mockImplementation(() => {
      console.log('createPost called');
      return Promise.resolve({ id: 'post1' });
    });
    // Mock the search params get method
    (mockSearchParams.get as jest.Mock).mockReturnValue(null);
  });

  it('renders loading state initially', async () => {
    // Mock loading state to be true initially
    jest.spyOn(require('../../contexts/AuthContext'), 'useAuth').mockImplementationOnce(() => ({
      user: null,
      isAuthenticated: false,
      loading: true,
    }));
    
    render(
      <Provider store={store}>
        <CreatePostPage />
      </Provider>,
    );
    
    // Check if loader is shown
    expect(screen.getByTestId('loader')).toBeInTheDocument();
    
    // Mock loading state to be false after initial render
    jest.spyOn(require('../../contexts/AuthContext'), 'useAuth').mockImplementationOnce(() => ({
      user: { id: '1', username: 'testuser' },
      isAuthenticated: true,
      loading: false,
    }));
    
    // Check if loader is removed after loading
    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });
  });

  it('renders the create post form after loading', async () => {
    render(
      <Provider store={store}>
        <CreatePostPage />
      </Provider>
    );
    await waitFor(() => {
      expect(screen.getByText('Create Post')).toBeInTheDocument();
      expect(screen.getByText('Choose a Community')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
      expect(screen.getByText('Image')).toBeInTheDocument();
      expect(screen.getByText('Link')).toBeInTheDocument();
      expect(screen.getByTestId('emoji-title-input')).toBeInTheDocument();
      expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument();
    });
  });

  it('pre-selects community from URL search params', async () => {
    (useSearchParams as jest.Mock).mockReturnValueOnce(new URLSearchParams('community=1'));
    render(
      <Provider store={store}>
        <CreatePostPage />
      </Provider>
    );
    await waitFor(() => {
      expect(screen.getByText('r/testcommunity')).toBeInTheDocument();
    });
  });

  it('displays validation error when submitting without community', async () => {
    render(
      <Provider store={store}>
        <CreatePostPage />
      </Provider>
    );
    await waitFor(() => expect(screen.getByText('Create Post')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Create Post'));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please select a community');
    });
  });

  it('displays validation error when submitting without title', async () => {
    render(
      <Provider store={store}>
        <CreatePostPage />
      </Provider>
    );
    await waitFor(() => expect(screen.getByText('Create Post')).toBeInTheDocument());
    fireEvent.change(screen.getByTestId('emoji-title-input'), { target: { value: '' } });
    fireEvent.change(screen.getByTestId('rich-text-editor'), { target: { value: 'Content' } });
    fireEvent.change(screen.getByTestId('community-select'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('Create Post'));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please enter a title');
    });
  });

  it('displays validation error for text post without content', async () => {
    render(
      <Provider store={store}>
        <CreatePostPage />
      </Provider>
    );
    await waitFor(() => expect(screen.getByText('Create Post')).toBeInTheDocument());
    fireEvent.change(screen.getByTestId('emoji-title-input'), { target: { value: 'Title' } });
    fireEvent.change(screen.getByTestId('rich-text-editor'), { target: { value: '' } });
    fireEvent.change(screen.getByTestId('community-select'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('Create Post'));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please enter post content');
    });
  });

  it('displays validation error for image post without image', async () => {
    render(
      <Provider store={store}>
        <CreatePostPage />
      </Provider>
    );
    await waitFor(() => expect(screen.getByText('Create Post')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Image'));
    fireEvent.change(screen.getByTestId('emoji-title-input'), { target: { value: 'Title' } });
    fireEvent.change(screen.getByTestId('community-select'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('Create Post'));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please upload an image');
    });
  });

  it('displays validation error for link post without URL', async () => {
    render(
      <Provider store={store}>
        <CreatePostPage />
      </Provider>
    );
    await waitFor(() => expect(screen.getByText('Create Post')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Link'));
    fireEvent.change(screen.getByTestId('emoji-title-input'), { target: { value: 'Title' } });
    fireEvent.change(screen.getByTestId('community-select'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('Create Post'));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please enter a link URL');
    });
  });

  it('submits a text post successfully', async () => {
    render(
      <Provider store={store}>
        <CreatePostPage />
      </Provider>
    );
    await waitFor(() => expect(screen.getByText('Create Post')).toBeInTheDocument());
    fireEvent.change(screen.getByTestId('emoji-title-input'), { target: { value: 'Test Title' } });
    fireEvent.change(screen.getByTestId('rich-text-editor'), { target: { value: 'Test Content' } });
    fireEvent.change(screen.getByTestId('community-select'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('Create Post'));
    await waitFor(() => {
      expect(postService.createPost).toHaveBeenCalledWith({
        title: 'Test Title',
        content: 'Test Content',
        type: PostType.TEXT,
        communityId: '1',
      });
      expect(toast.success).toHaveBeenCalledWith('Post created successfully!');
      expect(mockRouter.push).toHaveBeenCalledWith('/r/testcommunity');
    });
  });

  it('submits an image post successfully', async () => {
    render(
      <Provider store={store}>
        <CreatePostPage />
      </Provider>
    );
    await waitFor(() => expect(screen.getByText('Create Post')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Image'));
    fireEvent.change(screen.getByTestId('emoji-title-input'), { target: { value: 'Test Title' } });
    fireEvent.change(screen.getByTestId('image-upload'), { target: { value: 'http://image.com' } });
    fireEvent.change(screen.getByTestId('community-select'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('Create Post'));
    await waitFor(() => {
      expect(postService.createPost).toHaveBeenCalledWith({
        title: 'Test Title',
        type: PostType.IMAGE,
        communityId: '1',
        imageUrl: 'http://image.com',
      });
      expect(toast.success).toHaveBeenCalledWith('Post created successfully!');
      expect(mockRouter.push).toHaveBeenCalledWith('/r/testcommunity');
    });
  });

  it('submits a link post successfully', async () => {
    render(
      <Provider store={store}>
        <CreatePostPage />
      </Provider>
    );
    await waitFor(() => expect(screen.getByText('Create Post')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Link'));
    fireEvent.change(screen.getByTestId('emoji-title-input'), { target: { value: 'Test Title' } });
    fireEvent.change(screen.getByTestId('link-url-input'), { target: { value: 'http://link.com' } });
    fireEvent.change(screen.getByTestId('community-select'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('Create Post'));
    await waitFor(() => {
      expect(postService.createPost).toHaveBeenCalledWith({
        title: 'Test Title',
        type: PostType.LINK,
        communityId: '1',
        linkUrl: 'http://link.com',
      });
      expect(toast.success).toHaveBeenCalledWith('Post created successfully!');
      expect(mockRouter.push).toHaveBeenCalledWith('/r/testcommunity');
    });
  });

  it('handles tag search and selection', async () => {
    render(
      <Provider store={store}>
        <CreatePostPage />
      </Provider>
    );
    await waitFor(() => expect(screen.getByText('Create Post')).toBeInTheDocument());
    const tagInput = screen.getByPlaceholderText('Search and add tags...');
    await userEvent.type(tagInput, 'tag1');
    await waitFor(() => {
      expect(tagService.getTags).toHaveBeenCalledWith('tag1');
      expect(screen.getByText('#tag1')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('#tag1'));
    expect(screen.getByText('#tag1')).toBeInTheDocument(); // Tag chip should appear
    expect(screen.getByText('1/5 tags')).toBeInTheDocument();
  });

  it('removes a tag', async () => {
    render(
      <Provider store={store}>
        <CreatePostPage />
      </Provider>
    );
    await waitFor(() => expect(screen.getByText('Create Post')).toBeInTheDocument());
    const tagInput = screen.getByPlaceholderText('Search and add tags...');
    await userEvent.type(tagInput, 'tag1');
    await waitFor(() => expect(screen.getByText('#tag1')).toBeInTheDocument());
    fireEvent.click(screen.getByText('#tag1'));
    const removeButton = screen.getByLabelText('Remove tag tag1');
    fireEvent.click(removeButton);
    expect(screen.queryByText('#tag1')).not.toBeInTheDocument();
    expect(screen.getByText('0/5 tags')).toBeInTheDocument();
  });

  it('limits tags to 5', async () => {
    render(
      <Provider store={store}>
        <CreatePostPage />
      </Provider>
    );
    await waitFor(() => expect(screen.getByText('Create Post')).toBeInTheDocument());
    const tagInput = screen.getByPlaceholderText('Search and add tags...');
    // Simulate adding 5 tags
    for (let i = 1; i <= 5; i++) {
      (tagService.getTags as jest.Mock).mockResolvedValueOnce([{ id: `${i}`, name: `tag${i}` }]);
      await userEvent.type(tagInput, `tag${i}`);
      await waitFor(() => expect(screen.getByText(`#tag${i}`)).toBeInTheDocument());
      fireEvent.click(screen.getByText(`#tag${i}`));
    }
    expect(screen.getByText('5/5 tags')).toBeInTheDocument();
    expect(tagInput).toHaveAttribute('disabled');
    expect(screen.getByText('Maximum 5 tags reached. Remove tags to add more.')).toBeInTheDocument();
  });

  it('handles post creation error', async () => {
    (postService.createPost as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: 'Server error' } },
    });
    render(
      <Provider store={store}>
        <CreatePostPage />
      </Provider>
    );
    await waitFor(() => expect(screen.getByText('Create Post')).toBeInTheDocument());
    fireEvent.change(screen.getByTestId('emoji-title-input'), { target: { value: 'Test Title' } });
    fireEvent.change(screen.getByTestId('rich-text-editor'), { target: { value: 'Test Content' } });
    fireEvent.change(screen.getByTestId('community-select'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('Create Post'));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Server error');
    });
  });

  it('closes tag dropdown when clicking outside', async () => {
    render(
      <Provider store={store}>
        <CreatePostPage />
      </Provider>
    );
    await waitFor(() => expect(screen.getByText('Create Post')).toBeInTheDocument());
    const tagInput = screen.getByPlaceholderText('Search and add tags...');
    await userEvent.type(tagInput, 'tag1');
    await waitFor(() => expect(screen.getByText('#tag1')).toBeInTheDocument());
    fireEvent.mouseDown(document.body);
    await waitFor(() => {
      expect(screen.queryByText('#tag1')).not.toBeInTheDocument();
    });
  });

  it('should render the create post page', async () => {
    // Set a longer timeout for this test (30 seconds)
    jest.setTimeout(30000);
    
    // Mock all async services to resolve immediately
    (communityService.getJoinedCommunities as jest.Mock).mockResolvedValue({
      items: mockCommunities,
    });
    
    (tagService.getTags as jest.Mock).mockResolvedValue(mockTags);
    
    // Mock the useAuth hook
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false
    });

    // Render the component
    const { container, debug } = render(
      <Provider store={store}>
        <CreatePostPage />
      </Provider>
    );
    
    // Debug: Log the initial render
    debug();
    
    // Check for any immediate errors
    const errorBoundary = container.querySelector('[data-testid="error-boundary"]');
    if (errorBoundary) {
      console.error('Error boundary was triggered:', errorBoundary.textContent);
      throw new Error('Error boundary was triggered');
    }
    
    // Wait for the component to finish loading
    await waitFor(() => {
      // Check if the sidebar is rendered (a good indicator that the component mounted)
      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Check for the heading
    const heading = screen.getByRole('heading', { name: /create post/i });
    expect(heading).toBeInTheDocument();
    
    // Check for the back link
    const backLink = screen.getByRole('link', { name: /back to community/i });
    expect(backLink).toBeInTheDocument();
    
    // Check for the post type tabs
    const postTypeTabs = screen.getByRole('tablist');
    expect(postTypeTabs).toBeInTheDocument();
    
    // Check for the community select
    const communitySelect = screen.getByRole('combobox');
    expect(communitySelect).toBeInTheDocument();
    
    // Check for the title input
    const titleInput = screen.getByTestId('emoji-title-input');
    expect(titleInput).toBeInTheDocument();
    
    // Check for the rich text editor
    const editor = screen.getByTestId('rich-text-editor');
    expect(editor).toBeInTheDocument();
  });
});
export interface Post {
  id: string;
  title: string;
  content: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  type: string;
  score: number;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  isPinned: boolean;
  authorId: string;
  communityId: string;
  createdAt: string;
  updatedAt: string;
  author: User;
  community: {
    id: string;
    name: string;
    description: string;
    bannerUrl: string;
    memberCount: number;
    creatorId: string;
    settings: any;
    createdAt: string;
    updatedAt: string;
  };
  tags: Array<{
    id: string;
    name: string;
    usageCount: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface Comment {
  id: string;
  content: string;
  score: number;
  upvotes: number;
  downvotes: number;
  authorId: string;
  postId: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  author: User;
  post: {
    id: string;
    title: string;
    content: string | null;
    imageUrl: string | null;
    linkUrl: string | null;
    type: string;
    score: number;
    upvotes: number;
    downvotes: number;
    commentCount: number;
    isPinned: boolean;
    authorId: string;
    communityId: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface Community {
  id: string;
  name: string;
  description: string | null;
  bannerUrl: string | null;
  memberCount: number;
  creatorId: string;
  settings: any;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  reputationScore: number;
  postScore: number;
  commentScore: number;
  communityScore: number;
  createdAt: string;
  updatedAt: string;
  posts: Post[];
  comments: Comment[];
  upvoted: Array<Post | Comment>;
  downvoted: Array<Post | Comment>;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    status?: number;
  };
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

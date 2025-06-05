export interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  type: 'text' | 'image' | 'link';
  score: number;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  isPinned: boolean;
  authorId?: string;
  communityId?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  community: {
    id: string;
    name: string;
    description: string;
    iconUrl?: string;
    memberCount: number;
    createdAt: string;
  };
} 
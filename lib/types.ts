export interface User {
  id: string;
  username: string;
  karma: number;
  avatar: string;
}

export interface Community {
  id: string;
  name: string;
  icon: string;
  description?: string;
  members: number;
  createdAt: string;
}

export type ContentType = 'text' | 'image' | 'link';

export interface Tag {
  id: string;
  name: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  type: 'text' | 'image' | 'link' | 'video' | 'poll' | 'article';
  author: {
    id: string;
    username: string;
    avatar: string;
  };
  community: {
    id: string;
    name: string;
    description: string;
    icon: string;
    members: number;
    createdAt: string;
  };
  votes: number;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  score?: number;
  isSaved?: boolean;
  isHidden?: boolean;
  isLocked?: boolean;
  isSpoiler?: boolean;
  isNSFW?: boolean;
  url?: string;
  domain?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  votes: number;
  createdAt: string;
  replies?: Comment[];
}
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

export interface Post {
  id: string;
  title: string;
  content: string | Record<string, unknown>;
  contentType: ContentType;
  author: User;
  community: Community;
  votes: number;
  commentCount: number;
  createdAt: string;
  tags?: string[];
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  votes: number;
  createdAt: string;
  replies?: Comment[];
}
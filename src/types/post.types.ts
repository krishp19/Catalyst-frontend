import { Post } from './post';

export interface PostWithVote extends Omit<Post, 'author' | 'community' | 'userVote' | 'upvotes' | 'downvotes' | 'commentCount' | 'isPinned' | 'updatedAt' | 'tags'> {
  userVote?: 'up' | 'down' | null;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  isPinned: boolean;
  updatedAt: string;
  tags: string[];
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

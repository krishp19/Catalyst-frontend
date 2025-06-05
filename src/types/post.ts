export interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  type: 'text' | 'image' | 'link';
  contentType: 'text' | 'image' | 'link' | 'video' | 'poll' | 'article';
  score: number;
  upvotes: number;
  downvotes: number;
  votes: number;
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
  userVote?: 'up' | 'down' | null;
  isSaved?: boolean;
  isHidden?: boolean;
  isLocked?: boolean;
  isSpoiler?: boolean;
  isOC?: boolean;
  isNSFW?: boolean;
  url?: string;
  domain?: string;
  flair?: {
    text: string;
    cssClass: string;
    backgroundColor?: string;
    textColor?: string;
  };
  media?: {
    type: 'image' | 'video' | 'gif' | 'youtube' | 'vimeo';
    url: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    duration?: number;
    isGif?: boolean;
  };
  poll?: {
    options: Array<{
      id: string;
      text: string;
      votes: number;
      percentage: number;
      isVoted: boolean;
    }>;
    totalVotes: number;
    votingEndsAt?: string;
    isVoted: boolean;
  };
  crosspost?: {
    count: number;
    parentId?: string;
  };
  awards?: Array<{
    id: string;
    name: string;
    iconUrl: string;
    count: number;
  }>;
}
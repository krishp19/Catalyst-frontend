export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    karma: number;
    avatar?: string;
  };
  postId: string;
  votes: number;
  createdAt: string | Date;
  replies?: Comment[];
} 
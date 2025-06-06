import { httpClient } from '../lib/api/httpClient';

export interface Comment {
  id: string;
  content: string;
  postId: string;
  parentId?: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  score: number;
  userVote?: 'upvote' | 'downvote' | null;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

export interface CreateCommentData {
  content: string;
  postId: string;
  parentId?: string;
}

export interface CommentResponse {
  items: Comment[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

class CommentService {
  private baseUrl = '/comments';

  async createComment(data: CreateCommentData): Promise<Comment> {
    try {
      const response = await httpClient.post<Comment>(this.baseUrl, data);
      return response.data;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  async getComments(postId: string, page = 1, limit = 10, parentId?: string): Promise<CommentResponse> {
    try {
      const params = {
        page,
        limit,
        ...(parentId && { parentId }),
      };
      const response = await httpClient.get<CommentResponse>(`${this.baseUrl}/post/${postId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  async getReplies(commentId: string, page = 1, limit = 10): Promise<CommentResponse> {
    try {
      const params = {
        parentId: commentId,
        page,
        limit,
      };
      const response = await httpClient.get<CommentResponse>(this.baseUrl, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching replies:', error);
      throw error;
    }
  }

  async updateComment(commentId: string, content: string): Promise<Comment> {
    try {
      const response = await httpClient.patch<Comment>(`${this.baseUrl}/${commentId}`, { content });
      return response.data;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  async deleteComment(commentId: string): Promise<void> {
    try {
      await httpClient.delete(`${this.baseUrl}/${commentId}`);
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  async upvoteComment(commentId: string): Promise<Comment> {
    try {
      const response = await httpClient.post<Comment>(`${this.baseUrl}/${commentId}/upvote`);
      return response.data;
    } catch (error) {
      console.error('Error upvoting comment:', error);
      throw error;
    }
  }

  async downvoteComment(commentId: string): Promise<Comment> {
    try {
      const response = await httpClient.post<Comment>(`${this.baseUrl}/${commentId}/downvote`);
      return response.data;
    } catch (error) {
      console.error('Error downvoting comment:', error);
      throw error;
    }
  }

  async removeVote(commentId: string): Promise<Comment> {
    try {
      const response = await httpClient.delete<Comment>(`${this.baseUrl}/${commentId}/vote`);
      return response.data;
    } catch (error) {
      console.error('Error removing vote:', error);
      throw error;
    }
  }
}

export const commentService = new CommentService(); 
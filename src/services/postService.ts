import axios from 'axios';
import { httpClient } from '../lib/api/httpClient';
import { Post } from '../types/post';

export enum PostType {
  TEXT = 'text',
  IMAGE = 'image',
  LINK = 'link'
}

export enum PostSort {
  HOT = 'hot',
  NEW = 'new',
  TOP = 'top'
}

export interface CreatePostDto {
  title: string;
  content?: string;
  imageUrl?: string;
  linkUrl?: string;
  type: PostType;
  communityId: string;
}

export interface ApiResponse<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

class PostService {
  private baseUrl = '/posts';

  async getPosts(params: {
    page?: number;
    limit?: number;
    sort?: string;
    communityId?: string;
    showJoinedCommunities?: boolean;
  }): Promise<ApiResponse<Post>> {
    const { page = 1, limit = 10, sort = 'hot', communityId, showJoinedCommunities = false } = params;
    
    let url = `${this.baseUrl}`;
    
    if (showJoinedCommunities) {
      url += '/joined';
    }
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
      ...(communityId && { communityId })
    });
    
    const response = await httpClient.get(`${url}?${queryParams.toString()}`);
    return response.data;
  }

  async getPost(id: string): Promise<Post> {
    const response = await httpClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async createPost(data: {
    title: string;
    content: string;
    type: 'text' | 'image' | 'link';
    communityId: string;
    imageUrl?: string;
    linkUrl?: string;
  }): Promise<Post> {
    const response = await httpClient.post(this.baseUrl, data);
    return response.data;
  }

  async upvotePost(postId: string): Promise<Post> {
    try {
      console.log('Making upvote request for post:', postId);
      const response = await httpClient.post(`${this.baseUrl}/${postId}/upvote`);
      console.log('Upvote response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in upvotePost:', error);
      throw error;
    }
  }

  async downvotePost(postId: string): Promise<Post> {
    try {
      console.log('Making downvote request for post:', postId);
      const response = await httpClient.post(`${this.baseUrl}/${postId}/downvote`);
      console.log('Downvote response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in downvotePost:', error);
      throw error;
    }
  }

  async removeVote(postId: string): Promise<Post> {
    try {
      console.log('Making remove vote request for post:', postId);
      const response = await httpClient.delete(`${this.baseUrl}/${postId}/vote`);
      console.log('Remove vote response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in removeVote:', error);
      throw error;
    }
  }

  async getJoinedCommunityPosts(params: {
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<ApiResponse<Post>> {
    const { page = 1, limit = 10, sort = 'hot' } = params;
    const response = await httpClient.get(
      `${this.baseUrl}/joined?page=${page}&limit=${limit}&sort=${sort}`
    );
    return response.data;
  }

  async deletePost(postId: string): Promise<void> {
    try {
      console.log('Deleting post:', postId);
      await httpClient.delete(`${this.baseUrl}/${postId}`);
      console.log('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }
}

export const postService = new PostService();
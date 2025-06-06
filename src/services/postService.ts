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
  tags?: string[];
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
    const apiResponse = response.data;
    // Transform tags in each post
    const transformedPosts = apiResponse.items.map((post: { tags: { name: string; }[]; }) => ({
      ...post,
      tags: post.tags?.map((tag: { name: string }) => tag.name) || []
    }));
    return {
      ...apiResponse,
      items: transformedPosts
    };
  }

  async getPost(id: string): Promise<Post> {
    const response = await httpClient.get(`${this.baseUrl}/${id}`);
    const post = response.data;
    // Transform tags into an array of strings
    const transformedPost = {
      ...post,
      tags: post.tags?.map((tag: { name: any; }) => tag.name) || []
    };
    return transformedPost;
  }

  async createPost(data: CreatePostDto): Promise<Post> {
    try {
      console.log('Creating post with data:', data);
      const response = await httpClient.post(this.baseUrl, {
        title: data.title,
        content: data.content || null,
        imageUrl: data.imageUrl || null,
        linkUrl: data.linkUrl || null,
        type: data.type,
        communityId: data.communityId,
        tags: data.tags || [],
      });
      console.log('Post created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
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
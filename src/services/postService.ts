import { httpClient } from '../lib/api/httpClient';

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

export interface Post {
  id: string;
  title: string;
  content?: string;
  imageUrl?: string;
  linkUrl?: string;
  type: PostType;
  communityId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  score: number;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  isPinned: boolean;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  community: {
    id: string;
    name: string;
    iconUrl?: string;
  };
}

export interface PostsResponse {
  items: Post[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

class PostService {
  async createPost(data: CreatePostDto): Promise<Post> {
    const response = await httpClient.post('/api/posts', data);
    return response.data;
  }

  async getPosts(params?: {
    communityId?: string;
    page?: number;
    limit?: number;
    sort?: PostSort;
  }): Promise<PostsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.communityId) {
      queryParams.append('communityId', params.communityId);
    }
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.sort) {
      queryParams.append('sort', params.sort);
    }

    const response = await httpClient.get(`/api/posts?${queryParams.toString()}`);
    return response.data;
  }

  async getPost(id: string): Promise<Post> {
    const response = await httpClient.get(`/api/posts/${id}`);
    return response.data;
  }
}

export const postService = new PostService(); 
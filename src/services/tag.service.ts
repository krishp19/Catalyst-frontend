import axios from 'axios';
import { Tag } from '../types/tag.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const httpClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
httpClient.interceptors.request.use(
  (config) => {
    // Only run this on the client side
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('persist:root');
      if (auth) {
        try {
          const parsedAuth = JSON.parse(auth);
          const authState = JSON.parse(parsedAuth.auth);
          if (authState.accessToken) {
            config.headers.Authorization = `Bearer ${authState.accessToken}`;
          }
        } catch (error) {
          console.error('Error parsing auth state:', error);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const tagService = {
  // Get all tags with optional search
  getTags: async (searchTerm: string = ''): Promise<Tag[]> => {
    const response = await httpClient.get('/tags/search', {
      params: { query: searchTerm }
    });
    return response.data;
  },

  // Get popular tags
  getPopularTags: async (limit: number = 10): Promise<Tag[]> => {
    const response = await httpClient.get('/tags/popular', {
      params: { limit }
    });
    return response.data;
  },

  // Get tags by post
  getPostTags: async (postId: string): Promise<Tag[]> => {
    const response = await axios.get(`${API_URL}/posts/${postId}/tags`);
    return response.data;
  },

  // Add tags to post
  addTagsToPost: async (postId: string, tagNames: string[]): Promise<void> => {
    await axios.post(`${API_URL}/posts/${postId}/tags`, { tags: tagNames });
  },

  // Remove tag from post
  removeTagFromPost: async (postId: string, tagId: string): Promise<void> => {
    await axios.delete(`${API_URL}/posts/${postId}/tags/${tagId}`);
  }
};

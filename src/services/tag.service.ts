import axios from 'axios';
import { Tag } from '../types/tag.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const tagService = {
  // Get all tags with optional search
  getTags: async (searchTerm: string = ''): Promise<Tag[]> => {
    const response = await axios.get(`${API_URL}/tags`, {
      params: { search: searchTerm }
    });
    return response.data;
  },

  // Get popular tags
  getPopularTags: async (limit: number = 10): Promise<Tag[]> => {
    const response = await axios.get(`${API_URL}/tags/popular`, {
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

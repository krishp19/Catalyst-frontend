import axios from 'axios';
import { Topic } from '../types/topic.types';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api');

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Skip if we're in SSR
    if (typeof window === 'undefined') {
      return config;
    }
    
    try {
      // Get the persisted auth state from localStorage
      const persistRoot = localStorage.getItem('persist:root');
      if (!persistRoot) return config;
      
      // Parse the persisted state
      const parsedRoot = JSON.parse(persistRoot);
      if (!parsedRoot.auth) return config;
      
      // Parse the auth state
      const authState = JSON.parse(parsedRoot.auth);
      
      // Get the access token
      const accessToken = authState?.accessToken;
      
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      console.error('Error parsing auth state:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const topicService = {
  // Get all topics with optional search and pagination
  getTopics: async (searchTerm: string = '', page: number = 1, limit: number = 10): Promise<{ topics: Topic[]; total: number }> => {
    console.log('Fetching topics with search:', searchTerm); // Debug log
    try {
      console.log('API URL:', `${API_URL}/topics/search`); // Debug log
      
      const response = await api.get('/topics/search', {
        params: { 
          query: searchTerm,
          limit
        }
      });
      
      console.log('Topics response:', response.data); // Debug log
      return { 
        topics: Array.isArray(response.data) ? response.data : [], 
        total: Array.isArray(response.data) ? response.data.length : 0 
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error fetching topics:', {
          message: error.message,
          response: error.response?.data,
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
        });
      } else if (error instanceof Error) {
        console.error('Error fetching topics:', error.message);
      } else {
        console.error('Unknown error fetching topics:', error);
      }
      
      return { topics: [], total: 0 };
    }
  },

  // Get popular topics
  getPopularTopics: async (limit: number = 10): Promise<Topic[]> => {
    const response = await api.get('/topics/popular', {
      params: { limit }
    });
    return response.data;
  },

  // Get topics by community
  getCommunityTopics: async (communityId: string): Promise<Topic[]> => {
    const response = await api.get(`/communities/${communityId}/topics`);
    return response.data;
  },

  // Add topics to community
  addTopicsToCommunity: async (communityId: string, topicIds: string[]): Promise<void> => {
    await api.post(`/communities/${communityId}/topics`, { topicIds });
  },

  // Remove topic from community
  removeTopicFromCommunity: async (communityId: string, topicId: string): Promise<void> => {
    await api.delete(`/communities/${communityId}/topics/${topicId}`);
  }
};

import axios from 'axios';
import { httpClient } from '../lib/api/httpClient';

import { Topic } from '../types/topic.types';

export interface Community {
  id: string;
  name: string;
  description: string;
  bannerUrl: string;
  iconUrl: string;
  memberCount: number;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  topics?: Topic[];
  creator: {
    id: string;
    username: string;
    email: string;
    bio: string;
    avatarUrl: string;
    reputationScore: number;
    postScore: number;
    commentScore: number;
    communityScore: number;
    createdAt: string;
    updatedAt: string;
  };
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

export interface ApiErrorResponse {
  message: string;
  error: string;
  statusCode: number;
}

class CommunityService {
  private baseUrl = '/communities';

  async getCommunities(page = 1, limit = 10): Promise<ApiResponse<Community>> {
    const response = await httpClient.get(`${this.baseUrl}?page=${page}&limit=${limit}`);
    return response.data;
  }

  async createCommunity(communityData: {
    name: string;
    description: string;
    iconUrl?: string | null;
    bannerUrl?: string | null;
    topics?: string[];
  }): Promise<Community> {
    const response = await httpClient.post(this.baseUrl, communityData);
    return response.data;
  }



  async getCommunityByName(name: string): Promise<Community> {
    const response = await httpClient.get(`${this.baseUrl}/${name}`);
    return response.data;
  }

  async joinCommunity(communityId: string): Promise<void> {
    await httpClient.post(`${this.baseUrl}/${communityId}/join`);
  }

  async leaveCommunity(communityId: string): Promise<void> {
    await httpClient.post(`${this.baseUrl}/${communityId}/leave`);
  }

  async isMember(communityId: string): Promise<boolean> {
    try {
      console.log(`[communityService] Checking membership for community ${communityId}`);
      const response = await httpClient.get(`${this.baseUrl}/${communityId}/is-member`);
      console.log('[communityService] isMember response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
      
      // Handle different response formats
      if (typeof response.data === 'boolean') {
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        return response.data.isMember === true;
      }
      
      console.warn('[communityService] Unexpected response format:', response.data);
      return false;
    } catch (error: any) {
      console.error('[communityService] Error checking membership:', {
        error,
        message: error?.message || 'Unknown error',
        response: error?.response?.data
      });
      return false;
    }
  }

  async updateCommunity(communityId: string, updateData: {
    name?: string;
    description?: string;
    bannerUrl?: string | null;
    iconUrl?: string | null;
    topics?: string[];
  }): Promise<Community> {
    const response = await httpClient.patch(`${this.baseUrl}/${communityId}`, updateData);
    return response.data;
  }

  async getCommunityMembers(communityId: string, page = 1, limit = 10) {
    const response = await httpClient.get(`${this.baseUrl}/${communityId}/members`, {
      params: { page, limit }
    });
    return response.data;
  }

  async getJoinedCommunities(page = 1, limit = 10): Promise<ApiResponse<Community>> {
    const response = await httpClient.get(`${this.baseUrl}/user/joined?page=${page}&limit=${limit}`);
    return response.data;
  }

  /**
   * Get the current user's joined communities
   * @returns Array of communities the current user has joined
   */
  async getMyJoinedCommunities(): Promise<Community[]> {
    const response = await httpClient.get('/users/me/communities');
    return response.data;
  }
}

export const communityService = new CommunityService(); 
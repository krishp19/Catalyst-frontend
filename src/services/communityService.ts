import axios from 'axios';
import { httpClient } from '../lib/api/httpClient';

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
  private baseUrl = '/api/communities';

  async getCommunities(page = 1, limit = 10): Promise<ApiResponse<Community>> {
    const response = await httpClient.get(`${this.baseUrl}?page=${page}&limit=${limit}`);
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
      const response = await httpClient.get(`${this.baseUrl}/${communityId}/is-member`);
      return response.data.isMember;
    } catch (error) {
      return false;
    }
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
}

export const communityService = new CommunityService(); 
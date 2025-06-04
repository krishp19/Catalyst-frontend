import { httpClient } from '../lib/api/httpClient';

export interface Community {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  bannerUrl: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
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

  async getCommunities(page = 1, limit = 5): Promise<ApiResponse<Community>> {
    const response = await httpClient.get<ApiResponse<Community>>(this.baseUrl, {
      params: { page, limit }
    });
    return response.data;
  }

  async getCommunityByName(name: string): Promise<Community> {
    const response = await httpClient.get<Community>(`${this.baseUrl}/${name}`);
    return response.data;
  }

  async joinCommunity(communityId: string): Promise<{ message: string }> {
    try {
      const response = await httpClient.post<{ message: string }>(`${this.baseUrl}/${communityId}/join`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error;
      }
      throw new Error('Failed to join community');
    }
  }

  async leaveCommunity(communityId: string): Promise<{ message: string }> {
    const response = await httpClient.delete<{ message: string }>(`${this.baseUrl}/${communityId}/leave`);
    return response.data;
  }

  async getCommunityMembers(communityId: string, page = 1, limit = 10) {
    const response = await httpClient.get(`${this.baseUrl}/${communityId}/members`, {
      params: { page, limit }
    });
    return response.data;
  }

  async getJoinedCommunities(page = 1, limit = 10): Promise<ApiResponse<Community>> {
    const response = await httpClient.get<ApiResponse<Community>>(`${this.baseUrl}/user/joined`, {
      params: { page, limit }
    });
    return response.data;
  }
}

export const communityService = new CommunityService(); 
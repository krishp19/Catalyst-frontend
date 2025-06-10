import { httpClient } from '../lib/api/httpClient';

// Add interceptor to include auth token in requests
httpClient.interceptors.request.use(
  (config) => {
    // Only run this on the client side
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('persist:root');
      if (auth) {
        try {
          const parsedAuth = JSON.parse(auth);
          if (parsedAuth.auth) {
            const authState = JSON.parse(parsedAuth.auth);
            if (authState.accessToken) {
              config.headers.Authorization = `Bearer ${authState.accessToken}`;
            }
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

export interface Notification {
  id: string;
  type: string;
  read: boolean;
  recipientId: string;
  actorId: string;
  postId: string | null;
  commentId: string | null;
  createdAt: string;
  actor: {
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

export interface NotificationsResponse {
  items: Notification[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

class NotificationService {
  private baseUrl = '/notifications';

  async getNotifications(params: {
    page?: number;
    limit?: number;
    read?: boolean;
  } = {}): Promise<NotificationsResponse> {
    const { page = 1, limit = 10, read } = params;
    const response = await httpClient.get<NotificationsResponse>(this.baseUrl, {
      params: {
        page,
        limit,
        read,
      },
    });
    return response.data;
  }

  async markAsRead(notificationId: string): Promise<void> {
    await httpClient.post(`${this.baseUrl}/${notificationId}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await httpClient.post(`${this.baseUrl}/read-all`);
  }

  async getUnreadCount(): Promise<number> {
    const response = await httpClient.get<{ count: number }>(`${this.baseUrl}/count`);
    return response.data.count;
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/${notificationId}`);
  }
}

export const notificationService = new NotificationService();

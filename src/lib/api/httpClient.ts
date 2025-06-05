import { API_BASE_URL, DEFAULT_HEADERS } from './config';
import axios, { InternalAxiosRequestConfig } from 'axios';

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
}

export class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = API_BASE_URL, defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.defaultHeaders = { ...DEFAULT_HEADERS, ...defaultHeaders };
  }

  private async request<T>(
    endpoint: string,
    method: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, options.params);
    const headers = { ...this.defaultHeaders, ...options.headers };

    const config: RequestInit = {
      ...options,
      method,
      headers,
      credentials: 'include' as const,
    };

    if (data) {
      if (data instanceof FormData) {
        // If sending FormData, let the browser set the Content-Type header with boundary
        delete headers['Content-Type'];
        config.body = data;
      } else {
        config.body = JSON.stringify(data);
      }
    }

    try {
      const response = await fetch(url, config);
      let responseData;
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        throw new Error(responseData.message || 'Something went wrong');
      }

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    let url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
    if (params) {
      const queryString = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');
      
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    
    return url;
  }

  public get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET', undefined, options);
  }

  public post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', data, options);
  }

  public put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', data, options);
  }

  public patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PATCH', data, options);
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE', undefined, options);
  }
}

export const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to include auth token
httpClient.interceptors.request.use((config) => {
  // Get token from localStorage
  const persistRoot = localStorage.getItem('persist:root');
  if (persistRoot) {
    try {
      const { auth } = JSON.parse(persistRoot);
      const authState = JSON.parse(auth);
      if (authState.accessToken) {
        config.headers.Authorization = `Bearer ${authState.accessToken}`;
        console.log('Added auth token to request:', config.headers.Authorization); // Debug log
      } else {
        console.log('No access token found in auth state'); // Debug log
      }
    } catch (error) {
      console.error('Error parsing auth state:', error);
    }
  } else {
    console.log('No persist:root found in localStorage'); // Debug log
  }
  return config;
});

// Add response interceptor for debugging
httpClient.interceptors.response.use(
  (response) => {
    console.log('Response received:', response); // Debug log
    return response;
  },
  (error) => {
    console.error('Request failed:', error.response || error); // Debug log
    return Promise.reject(error);
  }
);

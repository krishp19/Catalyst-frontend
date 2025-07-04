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
      console.log(`Making ${method} request to:`, url);
      const response = await fetch(url, config);
      let responseData;
      
      const contentType = response.headers.get('content-type');
      try {
        responseData = contentType?.includes('application/json') 
          ? await response.json() 
          : await response.text();
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        responseData = await response.text();
      }

      console.log(`Response from ${url}:`, {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });

      if (!response.ok) {
        const error = new Error(responseData.message || 'Request failed');
        (error as any).response = {
          status: response.status,
          data: responseData,
          headers: response.headers,
        };
        throw error;
      }

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error: any) {
      console.error('API request failed:', {
        url,
        method,
        error: error.message,
        response: error.response,
      });
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

// Create axios instance with default config
const httpClient = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') + '/api',
  withCredentials: true, // Enable credentials (cookies, HTTP authentication)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
httpClient.interceptors.request.use((config) => {
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
});

// Add response interceptor for debugging
httpClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { httpClient };

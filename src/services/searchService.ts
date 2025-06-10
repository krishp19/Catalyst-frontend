import { httpClient } from '@/lib/api/httpClient';

export type SearchType = 'all' | 'posts' | 'communities';
export type SortType = 'relevance' | 'newest' | 'top';

export interface SearchParams {
  query: string;
  page?: number;
  limit?: number;
  sort?: SortType;
  type?: SearchType;
}

export interface SearchResult {
  communities: {
    id: string;
    name: string;
    description: string;
    memberCount: number;
    iconUrl?: string;
    createdAt: string;
  }[];
  posts: {
    id: string;
    title: string;
    content: string;
    score: number;
    commentCount: number;
    imageUrl?: string;
    community: {
      id: string;
      name: string;
    };
    author: {
      id: string;
      username: string;
    };
    createdAt: string;
  }[];
  total: number;
  page: number;
  totalPages: number;
}

export const search = async (params: SearchParams): Promise<SearchResult> => {
  const { data } = await httpClient.get<SearchResult>('/search', {
    params: {
      query: params.query,
      page: params.page || 1,
      limit: params.limit || 10,
      sort: params.sort || 'relevance',
      type: params.type || 'all',
    },
  });
  return data;
};

export interface Tag {
  id: string;
  name: string;
  description: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagDto {
  name: string;
  description: string;
}

export interface UpdateTagDto {
  name?: string;
  description?: string;
}

export interface TagSearchParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTopicDto {
  name: string;
  description: string;
}

export interface UpdateTopicDto {
  name?: string;
  description?: string;
}

export interface TopicSearchParams {
  search?: string;
  limit?: number;
  offset?: number;
}

import { httpClient } from '../lib/api/httpClient';
import { Post } from '../types/post';

class VoteService {
  private baseUrl = '/api/posts';

  async upvote(postId: string): Promise<Post> {
    try {
      console.log('Making upvote request for post:', postId);
      const response = await httpClient.post(`${this.baseUrl}/${postId}/upvote`);
      console.log('Upvote response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in upvote:', error);
      throw error;
    }
  }

  async downvote(postId: string): Promise<Post> {
    try {
      console.log('Making downvote request for post:', postId);
      const response = await httpClient.post(`${this.baseUrl}/${postId}/downvote`);
      console.log('Downvote response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in downvote:', error);
      throw error;
    }
  }

  async removeVote(postId: string): Promise<Post> {
    try {
      console.log('Making remove vote request for post:', postId);
      const response = await httpClient.delete(`${this.baseUrl}/${postId}/vote`);
      console.log('Remove vote response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in removeVote:', error);
      throw error;
    }
  }
}

export const voteService = new VoteService(); 
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  // Add other user properties as needed
}

export const mockUser: User = {
  id: 'user-123',
  username: 'testuser',
  email: 'test@example.com',
  avatar: '/path/to/avatar.jpg',
};

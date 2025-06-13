// Mock implementation of formatDistanceToNow
const formatDistanceToNow = jest.fn().mockReturnValue('5 years ago');

// Export all the original functions, but override formatDistanceToNow
export * from 'date-fns';
export { formatDistanceToNow };

// Make it a module with exports
export default {
  formatDistanceToNow,
};

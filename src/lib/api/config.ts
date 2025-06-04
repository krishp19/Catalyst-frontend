// API base URL configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Common headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

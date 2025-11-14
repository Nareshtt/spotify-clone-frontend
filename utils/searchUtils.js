import { searchYouTube } from './api';

export const performSearch = async (query, maxResults = 5) => {
  if (!query.trim()) {
    throw new Error('Search query cannot be empty');
  }

  try {
    const result = await searchYouTube(query, maxResults);
    console.log('Raw API Response:', JSON.stringify(result, null, 2));
    return result.videos || result || [];
  } catch (error) {
    console.error('Search error:', error);
    throw new Error(error.message || 'Failed to search videos');
  }
};

export const validateSearchQuery = (query) => {
  return query && query.trim().length > 0;
};
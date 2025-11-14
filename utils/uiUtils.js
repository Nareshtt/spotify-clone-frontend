import { getYouTubeThumbnail } from './api';

export const getThumbnailUrl = (thumbnailUrl) => {
  return getYouTubeThumbnail(thumbnailUrl);
};

export const formatDuration = (duration) => {
  if (!duration || duration === '0:00') {
    return 'Unknown';
  }
  return duration;
};

export const truncateTitle = (title, maxLength = 60) => {
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength) + '...';
};

export const showSuccessAlert = (title, uri) => {
  return {
    title: '✓ Success',
    message: `Downloaded: ${title}\n\nSaved to:\n${uri}`
  };
};

export const showErrorAlert = (error) => {
  return {
    title: 'Download Error',
    message: error.message || 'Failed to download audio'
  };
};
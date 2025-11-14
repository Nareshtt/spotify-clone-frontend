// For local: 'http://192.168.1.37:8000/api/'
// For internet: Replace with your localtunnel URL + '/api/' (e.g., 'https://random-name.loca.lt/api/')
const BASE_URL = 'https://juxtify-music.loca.lt/api/';

// Search YouTube videos
export const searchYouTube = async (query, maxResults = 5) => {
  const url = `${BASE_URL}search/?q=${encodeURIComponent(query)}&max_results=${maxResults}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return await res.json();
};

// Get proxied YouTube thumbnail (to bypass CORS)
export const getYouTubeThumbnail = (thumbnailUrl) => {
  return `${BASE_URL}thumbnail/?url=${encodeURIComponent(thumbnailUrl)}`;
};

// Get YouTube audio download URL
export const getYouTubeAudioUrl = async (youtubeUrl) => {
  const res = await fetch(`${BASE_URL}download/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: youtubeUrl }),
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return await res.json();
};

export default { searchYouTube, getYouTubeThumbnail, getYouTubeAudioUrl };

import axios from 'axios';

// Use Netlify Functions URL or fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-17-10-2025.netlify.app/.netlify/functions';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

export const scraperAPI = {
  // Updated to match Netlify Functions endpoints
  scrapeUrl: (data) => api.post('/scrape', data),
  previewScrape: (data) => api.post('/preview', data),
};

export const dataAPI = {
  // Updated to match Netlify Functions endpoints
  getAllData: (page = 1, limit = 10) => api.get(`/data?page=${page}&limit=${limit}`),
  getStatistics: () => api.get('/data/stats'),
  deleteData: (id) => api.delete(`/data/${id}`),
};

export default api;

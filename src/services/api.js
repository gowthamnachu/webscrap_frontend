import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

export const scraperAPI = {
  scrapeUrl: (data) => api.post('/scraper/scrape', data),
  previewScrape: (data) => api.post('/scraper/preview', data),
};

export const dataAPI = {
  getAllData: (page = 1, limit = 10) => api.get(`/data?page=${page}&limit=${limit}`),
  getStatistics: () => api.get('/data/stats'),
  deleteData: (id) => api.delete(`/data/${id}`),
};

export default api;

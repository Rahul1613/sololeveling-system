import axios from 'axios';
import { API_URL } from '../config';

// Create axios instance with base URL
const api = axios.create({
  baseURL: `${API_URL}/api/titles`
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const titlesService = {
  // Get all titles the user has unlocked
  getUserTitles: () => {
    return api.get('/user');
  },
  
  // Get all titles available for unlocking
  getAvailableTitles: () => {
    return api.get('/available');
  },
  
  // Equip a title
  equipTitle: (titleId) => {
    return api.post(`/equip/${titleId}`);
  },
  
  // Unequip the current title
  unequipTitle: () => {
    return api.post('/unequip');
  },
  
  // Get title details
  getTitleDetails: (titleId) => {
    return api.get(`/${titleId}`);
  }
};

export default titlesService;

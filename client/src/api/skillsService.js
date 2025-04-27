import axios from 'axios';
import { API_URL } from '../config';

// Create axios instance with base URL
const api = axios.create({
  baseURL: `${API_URL}/api/skills`
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

const skillsService = {
  // Get all skills the user has unlocked
  getUserSkills: () => {
    return api.get('/user');
  },
  
  // Get all skills available for unlocking
  getAvailableSkills: () => {
    return api.get('/available');
  },
  
  // Get skill tree
  getSkillTree: () => {
    return api.get('/tree');
  },
  
  // Unlock a new skill
  unlockSkill: (skillId) => {
    return api.post(`/unlock/${skillId}`);
  },
  
  // Equip a skill to a slot
  equipSkill: (skillId, slotIndex) => {
    return api.post(`/equip/${skillId}`, { slotIndex });
  },
  
  // Unequip a skill
  unequipSkill: (skillId) => {
    return api.post(`/unequip/${skillId}`);
  },
  
  // Use a skill (optionally with a target)
  useSkill: (skillId, targetId = null) => {
    return api.post(`/use/${skillId}`, targetId ? { targetId } : {});
  },
  
  // Level up a skill
  levelUpSkill: (skillId) => {
    return api.post(`/levelup/${skillId}`);
  },
  
  // Get skill details
  getSkillDetails: (skillId) => {
    return api.get(`/${skillId}`);
  }
};

export default skillsService;

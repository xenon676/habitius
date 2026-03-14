import axios from 'axios';
import { API_BASE_URL } from './config';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  // Player Stats
  hp: number;
  max_hp: number;
  xp: number;
  max_xp: number;
  level: number;
  gold: number;
  mana: number;
  max_mana: number;
  // Character Stats
  strength: number;
  constitution: number;
  intelligence: number;
  perception: number;
}

export interface UserStats {
  hp: number;
  max_hp: number;
  xp: number;
  max_xp: number;
  level: number;
  gold: number;
  mana: number;
  max_mana: number;
  strength: number;
  constitution: number;
  intelligence: number;
  perception: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await axios.post(`${API_BASE_URL}/auth/token`, formData);
    return response.data;
  },

  register: async (credentials: LoginCredentials): Promise<User> => {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, credentials);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await axios.get(`${API_BASE_URL}/auth/me`);
    return response.data;
  },

  getUserStats: async (): Promise<User> => {
    const response = await axios.get(`${API_BASE_URL}/users/me/stats`);
    return response.data;
  },

  updateUserStats: async (stats: Partial<UserStats>): Promise<User> => {
    const response = await axios.put(`${API_BASE_URL}/users/me/stats`, stats);
    return response.data;
  },
};

export default authApi; 
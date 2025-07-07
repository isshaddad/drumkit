import axios from 'axios';
import { Load, CreateLoadRequest, ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const loadService = {
  // Get all loads
  getLoads: async (page: number = 0): Promise<ApiResponse<Load[]>> => {
    try {
      const params = page > 0 ? { page } : {};
      const response = await api.get('/api/loads', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching loads:', error);
      throw error;
    }
  },

  // Create a new load
  createLoad: async (
    loadData: CreateLoadRequest
  ): Promise<ApiResponse<Load>> => {
    try {
      const response = await api.post('/api/loads', loadData);
      return response.data;
    } catch (error) {
      console.error('Error creating load:', error);
      throw error;
    }
  },
};

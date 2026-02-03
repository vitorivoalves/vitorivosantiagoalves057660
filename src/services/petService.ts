import { api } from './api';
import type { Page, Pet } from '../types'; // CORREÇÃO: 'type' explícito

export const PetService = {
  getAll: async (page = 0, nome = '') => {
    try {
      const response = await api.get<Page<Pet>>('/v1/pets', { 
        params: { page, size: 10, nome } 
      });
      return { data: response.data.content, total: response.data.total, isOffline: false };
    } catch (error) {
      console.warn("API Error. Using Fallback.");
      return { data: [], total: 0, isOffline: true };
    }
  },

  getById: async (id: string) => {
    const response = await api.get<Pet>(`/v1/pets/${id}`);
    return response.data;
  },

  save: async (data: Partial<Pet>, id?: string) => {
    if (id) {
      return api.put(`/v1/pets/${id}`, data);
    }
    return api.post('/v1/pets', data);
  },

  uploadPhoto: async (id: number | string, file: File) => {
    const formData = new FormData();
    formData.append('foto', file);
    return api.post(`/v1/pets/${id}/fotos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};
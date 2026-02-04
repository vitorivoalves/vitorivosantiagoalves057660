import { api } from './api';
import type { Page, Pet } from '../types';

export const PetService = {
  getAll: async (page = 0, nome = '', size = 10) => {
    try {
      const response = await api.get<Page<Pet>>('/v1/pets', { params: { page, size, nome } });
      return { data: response.data.content, total: response.data.total, isOffline: false };
    } catch (error) { return { data: [], total: 0, isOffline: true }; }
  },
  getById: async (id: string) => (await api.get<Pet>(`/v1/pets/${id}`)).data,
  save: async (data: Partial<Pet>, id?: string) => {
    return id ? api.put(`/v1/pets/${id}`, data) : api.post('/v1/pets', data);
  },
  uploadPhoto: async (id: number | string, file: File) => {
    const formData = new FormData();
    formData.append('foto', file);
    return api.post(`/v1/pets/${id}/fotos`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  // NOVO: Método de Exclusão
  delete: async (id: string | number) => {
    return api.delete(`/v1/pets/${id}`);
  }
};
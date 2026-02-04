import { api } from './api';
import type { Page, Tutor } from '../types';

export const TutorService = {
  getAll: async (page = 0, nome = '') => {
    const response = await api.get<Page<Tutor>>('/v1/tutores', { params: { page, size: 10, nome } });
    return response.data;
  },
  getById: async (id: string) => (await api.get<Tutor>(`/v1/tutores/${id}`)).data,
  save: async (data: Partial<Tutor>, id?: string) => {
    return id ? api.put(`/v1/tutores/${id}`, data) : api.post('/v1/tutores', data);
  },
  uploadPhoto: async (id: number | string, file: File) => {
    const formData = new FormData();
    formData.append('foto', file);
    return api.post(`/v1/tutores/${id}/fotos`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  vincularPet: async (tutorId: number, petId: number) => api.post(`/v1/tutores/${tutorId}/pets/${petId}`),
  desvincularPet: async (tutorId: number, petId: number) => api.delete(`/v1/tutores/${tutorId}/pets/${petId}`),
  // NOVO: Método de Exclusão
  delete: async (id: string | number) => {
    return api.delete(`/v1/tutores/${id}`);
  }
};
import { api } from './api';
import type { Page, Tutor } from '../types'; // CORREÇÃO: 'type' explícito

export const TutorService = {
  getAll: async (page = 0, nome = '') => {
    const response = await api.get<Page<Tutor>>('/v1/tutores', {
      params: { page, size: 10, nome }
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Tutor>(`/v1/tutores/${id}`);
    return response.data;
  },

  save: async (data: Partial<Tutor>, id?: string) => {
    if (id) {
      return api.put(`/v1/tutores/${id}`, data);
    }
    return api.post('/v1/tutores', data);
  },

  vincularPet: async (tutorId: number, petId: number) => {
    return api.post(`/v1/tutores/${tutorId}/pets/${petId}`);
  },

  desvincularPet: async (tutorId: number, petId: number) => {
    return api.delete(`/v1/tutores/${tutorId}/pets/${petId}`);
  }
};
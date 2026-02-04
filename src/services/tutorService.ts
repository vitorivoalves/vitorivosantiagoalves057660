import { api } from './api';
import type { Page, Tutor } from '../types';

export const TutorService = {
  // Listagem com paginação e filtro por nome
  getAll: async (page = 0, nome = '') => {
    // API: GET /v1/tutores
    const response = await api.get<Page<Tutor>>('/v1/tutores', {
      params: { page, size: 10, nome }
    });
    return response.data;
  },

  // Busca detalhada por ID
  getById: async (id: string) => {
    // API: GET /v1/tutores/{id}
    const response = await api.get<Tutor>(`/v1/tutores/${id}`);
    return response.data;
  },

  // Criação (POST) ou Atualização (PUT)
  save: async (data: Partial<Tutor>, id?: string) => {
    if (id) {
      // API: PUT /v1/tutores/{id}
      return api.put(`/v1/tutores/${id}`, data);
    }
    // API: POST /v1/tutores
    return api.post('/v1/tutores', data);
  },

  // Upload de Foto do Tutor
  uploadPhoto: async (id: number | string, file: File) => {
    const formData = new FormData();
    formData.append('foto', file);
    // API: POST /v1/tutores/{id}/fotos
    return api.post(`/v1/tutores/${id}/fotos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Vinculação bidirecional (Tutor <-> Pet)
  vincularPet: async (tutorId: number, petId: number) => {
    // API: POST /v1/tutores/{id}/pets/{petId}
    return api.post(`/v1/tutores/${tutorId}/pets/${petId}`);
  },

  desvincularPet: async (tutorId: number, petId: number) => {
    // API: DELETE /v1/tutores/{id}/pets/{petId}
    return api.delete(`/v1/tutores/${tutorId}/pets/${petId}`);
  }
};
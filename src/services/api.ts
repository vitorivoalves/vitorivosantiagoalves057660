// src/services/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://pet-manager-api.geia.vip',
  timeout: 10000,
});

// Interceptor de Requisição: Injeta o Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Resposta: Trata Expiração (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se deu 401 (Não autorizado) e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          // Tenta renovar o token usando o endpoint do Swagger
          // O Swagger diz: O refresh token deve ser enviado no cabeçalho 'Authorization' [cite: 325]
          const response = await axios.put(
            'https://pet-manager-api.geia.vip/autenticacao/refresh',
            {},
            { headers: { Authorization: `Bearer ${refreshToken}` } }
          );

          const { access_token, refresh_token } = response.data;
          
          // Salva os novos tokens
          localStorage.setItem('token', access_token);
          localStorage.setItem('refresh_token', refresh_token);

          // Atualiza o header da requisição original e tenta de novo
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
          
          return api(originalRequest);
        } catch (refreshError) {
          console.error("Sessão expirada. Faça login novamente.");
          // Se falhar o refresh, desloga
          localStorage.clear();
          window.location.href = '/'; 
        }
      } else {
        localStorage.clear();
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);
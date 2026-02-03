// src/types/index.ts

// Auth
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// Foto (Compartilhado)
export interface Foto {
  id: number;
  nome: string;
  contentType: string;
  url: string;
}

// Pet (Alinhado com Swagger: sem espécie, com foto opcional)
export interface Pet {
  id: number;
  nome: string;
  raca: string;
  idade: number;
  foto?: Foto;
  // O Swagger não retorna tutor dentro da lista de pets simples, 
  // mas retorna no detalhe. Vamos manter opcional.
  tutores?: Tutor[]; 
}

// Tutor (Alinhado com Swagger: com CPF e Email)
export interface Tutor {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cpf: number; // API espera number, mas no form tratamos como string mascarada
  foto?: Foto;
  pets?: Pet[]; // Lista de pets vinculados
}

// Paginação Genérica
export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  total: number;
  pageCount: number;
}
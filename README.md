# Pet Manager - Front End

## Visão Geral
Aplicação SPA desenvolvida em **React + TypeScript + Vite** para gerenciamento de Pets e Tutores. O projeto utiliza uma arquitetura resiliente com **Fallback Strategy**, garantindo que a interface funcione em modo de demonstração mesmo se a API estiver indisponível (Mock Data).

## Tecnologias
* **React 18 & TypeScript**
* **Vite** (Build otimizado)
* **Axios** (Integração API)
* **React Router** (Lazy Loading & Transições)
* **CSS Modules** (Design System Dark Mode)

## Como Executar

### Via Docker
```bash
docker build -t pet-manager .
docker run -p 8080:80 pet-manager
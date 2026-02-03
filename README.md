# Pet Manager - Front End

Este projeto consiste em uma Single Page Application (SPA) desenvolvida para o gerenciamento de pets e tutores. A aplicação foi construída como parte do processo seletivo para a Polícia Judiciária Civil do Estado de Mato Grosso, atendendo aos requisitos de desenvolvimento Front End utilizando React e TypeScript.

## Visão Geral

A aplicação permite a autenticação de usuários, cadastro e edição de tutores, cadastro e edição de pets, upload de imagens e o gerenciamento do vínculo entre tutores e pets. O sistema foi projetado com foco em resiliência, utilizando interceptadores de requisição para gerenciar a renovação de tokens JWT automaticamente.

## Tecnologias Utilizadas

O projeto foi desenvolvido utilizando as seguintes tecnologias e bibliotecas:

- **React 18:** Biblioteca principal para construção da interface.
- **TypeScript:** Superset do JavaScript para tipagem estática e segurança de código.
- **Vite:** Ferramenta de build e servidor de desenvolvimento otimizado.
- **Axios:** Cliente HTTP para comunicação com a API REST.
- **React Router DOM:** Gerenciamento de rotas e navegação SPA com suporte a Lazy Loading.
- **React Hook Form:** Gerenciamento de estado e validação de formulários.
- **Vitest & React Testing Library:** Framework de testes unitários.
- **Docker:** Containerização da aplicação para distribuição e deploy.
- **Nginx:** Servidor web utilizado para servir a aplicação estática dentro do container.

## Arquitetura e Decisões de Projeto

A arquitetura do projeto segue o padrão de separação de responsabilidades para garantir manutenibilidade e escalabilidade (Clean Code).

### Camada de Serviço (Facade Pattern)
Toda a comunicação direta com a API externa foi isolada na pasta `src/services`. Os componentes visuais não realizam chamadas HTTP diretamente, mas consomem métodos abstratos (ex: `PetService.getAll`, `TutorService.save`). Isso desacopla a interface da lógica de dados.

### Autenticação e Interceptadores
Foi implementado um mecanismo robusto de autenticação JWT via Axios Interceptors (`src/services/api.ts`):
1.  **Request Interceptor:** Injeta automaticamente o token de acesso no cabeçalho `Authorization` de todas as requisições.
2.  **Response Interceptor:** Monitora erros `401 Unauthorized`. Caso o token expire, o sistema tenta automaticamente utilizar o endpoint `/autenticacao/refresh` para renovar a sessão sem interromper a experiência do usuário. Caso a renovação falhe, o usuário é redirecionado para o login.

### Lazy Loading
Para otimizar o carregamento inicial da aplicação (Performance), as rotas dos módulos de Pets e Tutores são carregadas sob demanda utilizando `React.lazy` e `Suspense`.

### Divergências entre Edital e API (Swagger)
Durante a implementação, foram identificadas inconsistências entre o texto do Edital e a documentação técnica da API (`/q/openapi`). Para garantir o funcionamento da aplicação, prevaleceram as definições técnicas da API (Swagger). As seguintes adaptações foram realizadas:

1.  **Login de Usuário:**
    - O edital não especificava os campos de login.
    - A API exige os campos `username` e `password`. O formulário foi ajustado para refletir essa exigência.

2.  **Cadastro de Tutores:**
    - [cite_start]O edital solicitava apenas Nome, Telefone e Endereço[cite: 96].
    - [cite_start]O Swagger define os campos `cpf` e `email` como obrigatórios para o sucesso da requisição `POST /v1/tutores`[cite: 627, 630].
    - **Decisão:** Foram adicionados os campos CPF e E-mail ao formulário, incluindo máscaras de validação para garantir o formato correto exigido pela API (apenas números para o CPF).

3.  **Cadastro de Pets:**
    - [cite_start]O edital mencionava o campo "Espécie"[cite: 91].
    - [cite_start]O Swagger (Schemas `PetRequestDto`) não possui propriedade para espécie, aceitando apenas `nome`, `raca` e `idade` [cite: 357-361].
    - **Decisão:** O campo espécie foi removido do envio de dados para evitar erros de "Bad Request" (400) na API.

## Estrutura de Pastas

- **src/components:** Componentes reutilizáveis (Loading, Layouts).
- **src/pages:** Telas da aplicação (Login, Listagens, Formulários).
- **src/services:** Configuração do Axios e métodos de acesso à API.
- **src/types:** Definições de tipos TypeScript (Interfaces DTO).
- **src/utils:** Funções utilitárias (Máscaras de CPF e Telefone).
- **src/tests:** Configuração e arquivos de testes unitários.

## Pré-requisitos

Para executar o projeto localmente, é necessário ter instalado:
- Node.js (versão 18 ou superior)
- Docker (opcional, para execução em container)

## Instruções de Execução

### Opção 1: Execução via Docker (Recomendado)
Esta opção simula o ambiente de produção, servindo a aplicação compilada através do Nginx.

1.  Construa a imagem Docker:
    ```bash
    docker build -t pet-manager-frontend .
    ```

2.  Inicie o container mapeando a porta 8080:
    ```bash
    docker run -p 8080:80 pet-manager-frontend
    ```

3.  Acesse a aplicação no navegador através do endereço:
    `http://localhost:8080`

### Opção 2: Execução Local (Desenvolvimento)

1.  Instale as dependências do projeto:
    ```bash
    npm install
    ```

2.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

3.  Acesse a aplicação no endereço indicado no terminal (geralmente `http://localhost:5173`).

### Execução dos Testes

Para executar a bateria de testes unitários configurada com Vitest:

```bash
npm run test
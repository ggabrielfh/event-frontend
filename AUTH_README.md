# Sistema de Autenticação - Event Hub

Este documento explica como o sistema de autenticação foi implementado no Event Hub.

## Componentes Criados

### 1. AuthContext (`src/contexts/AuthContext.tsx`)

Contexto React que gerencia o estado global de autenticação:

- **Estado**: usuário logado, status de carregamento, se está autenticado
- **Funções**: login, logout, verificação de autenticação
- **Integração**: conecta com a API Go via `apiService`

### 2. ProtectedRoute (`src/components/ProtectedRoute.tsx`)

Componente que protege rotas que requerem autenticação:

- Verifica se o usuário está logado
- Exibe loading durante verificação
- Redireciona para login se não autenticado
- Renderiza o componente filho se autenticado

### 3. ApiService (`src/utils/apiService.ts`)

Serviço para comunicação com a API Go:

- **Base URL**: `http://localhost:8080`
- **Credenciais**: inclui cookies automaticamente
- **Endpoints**: login, logout, validação de auth
- **Error Handling**: tratamento de erros padronizado

### 4. UserProfile (`src/components/UserProfile.tsx`)

Componente que exibe informações do usuário logado:

- Avatar com iniciais do usuário
- Email e data de cadastro
- Botão de logout

### 5. Header (`src/components/Header.tsx`)

Cabeçalho padrão para páginas protegidas:

- Logo/título do app
- Menu de navegação
- Perfil do usuário com logout

### 6. useAuthActions (`src/hooks/useAuthActions.ts`)

Hook personalizado para ações de autenticação:

- Função `handleLogout` com redirecionamento
- Função `requireAuth` para validação
- Acesso aos dados do usuário

## Como Usar

### 1. Envolver toda a aplicação com AuthProvider

```tsx
// App.tsx
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return <AuthProvider>{/* suas rotas aqui */}</AuthProvider>;
}
```

### 2. Proteger rotas específicas

```tsx
// App.tsx
import ProtectedRoute from "./components/ProtectedRoute";

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>;
```

### 3. Usar dados de autenticação em componentes

```tsx
// Qualquer componente
import { useAuth } from "../contexts/AuthContext";

function MeuComponente() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <div>
      <p>Olá, {user?.email}!</p>
      <button onClick={logout}>Sair</button>
    </div>
  );
}
```

### 4. Fazer login

```tsx
// LoginPage.tsx
import { useAuth } from "../contexts/AuthContext";

function LoginPage() {
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    }
  };
}
```

## Integração com API Go

### Endpoints Utilizados

- `POST /auth/login` - Login do usuário
- `GET /auth/logout` - Logout do usuário
- `GET /auth/` - Validação de token/sessão

### Autenticação

- A API usa **cookies HTTP-only** para sessão
- O middleware `AuthMiddleware` valida JWT em cookies
- Frontend inclui cookies automaticamente (`credentials: 'include'`)

### Fluxo de Autenticação

1. Usuario faz login → POST `/auth/login`
2. API retorna token JWT no cookie `Authorization`
3. Frontend armazena estado no contexto
4. Requisições subsequentes incluem cookie automaticamente
5. API valida token via middleware em rotas protegidas

## Rotas Protegidas vs Públicas

### Públicas (não requerem autenticação)

- `/login` - Página de login
- `/register` - Página de registro

### Protegidas (requerem autenticação)

- `/` - Página inicial
- `/dashboard` - Dashboard do usuário
- `/create-event` - Criar evento
- `/event/:id` - Detalhes do evento
- `/event/:id/attendees` - Lista de participantes

## Funcionalidades

### ✅ Implementado

- [x] Login com email/senha
- [x] Logout com limpeza de sessão
- [x] Proteção de rotas
- [x] Validação automática de sessão
- [x] Componentes de UI (Header, UserProfile)
- [x] Fallback para localStorage
- [x] Loading states
- [x] Error handling

### 🔄 Melhorias Futuras

- [ ] Refresh token automático
- [ ] Timeout de sessão
- [ ] Remember me
- [ ] Roles/permissões
- [ ] 2FA (Two-Factor Authentication)

## Configuração Necessária

### Frontend

1. Certificar que a API está rodando em `http://localhost:8080`
2. Instalar dependências do React Router DOM (já instalado)

### Backend (API Go)

1. Configurar CORS para `http://localhost:3000`
2. Definir `JWT_SECRET_KEY` no ambiente
3. Middleware de autenticação aplicado nas rotas

## Troubleshooting

### Problema: "Token not provided"

- Verificar se a API está configurada para aceitar cookies
- Confirmar que CORS está configurado corretamente
- Verificar se `credentials: 'include'` está nas requisições

### Problema: Redirecionamento infinito

- Verificar se `ProtectedRoute` não está envolvendo `/login`
- Confirmar que contexto está acima de todas as rotas
- Verificar se `isLoading` está sendo tratado corretamente

### Problema: Logout não funciona

- Verificar se endpoint `/auth/logout` existe na API
- Confirmar que cookies estão sendo limpos
- Verificar se localStorage está sendo limpo

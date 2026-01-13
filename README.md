# Hub 26

Plataforma de comunidade para revendedores com catálogo de produtos, fornecedores validados e fórum.

## Stack

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Estado:** TanStack Query

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute o arquivo `supabase/SETUP_COMPLETO.sql` no SQL Editor
3. Copie `.env.example` para `.env` e preencha com suas credenciais:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

### 3. Rodar localmente

```bash
npm run dev
```

Acesse: http://localhost:8080

## Estrutura

```
src/
├── components/    # Componentes React
├── contexts/      # AuthContext, NotificationContext
├── hooks/         # Hooks customizados (use-products, etc)
├── pages/         # Páginas da aplicação
└── integrations/  # Cliente Supabase
```

## Funcionalidades

- ✅ Autenticação (login/cadastro)
- ✅ Catálogo de produtos por categoria
- ✅ Comunidade (posts, comentários, likes)
- ✅ Notificações em tempo real
- ✅ Painel administrativo
- ⚠️ Fornecedores (usa dados mock)
- ⚠️ Bazar (usa dados mock)

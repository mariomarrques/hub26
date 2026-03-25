# Tasks — Admin Users Rebuild

## Task 1 — Auditar fonte mínima confiável para usuários admin
### Objetivo
Descobrir a fonte mais previsível para alimentar usuários e usuários recentes sem depender do fluxo frágil atual.

### Fazer
- Inspecionar tables reais disponíveis
- Ver se `profiles + user_roles` sustentam a listagem
- Ver se `email` pode vir de `auth.users` via função segura
- Definir a menor estratégia confiável

### Pronto quando
- Existe plano técnico claro para listar usuários
- Existe plano claro para recent users
- Escopo continua mínimo

### Limites
- Não implementar ainda
- Não mexer em logs

---

## Task 2 — Reimplementar a camada de dados de usuários admin
### Objetivo
Criar uma fonte de dados confiável para a aba Usuários e dashboard.

### Fazer
- Criar query/RPC mínima confiável
- Retornar:
  - id
  - name
  - avatar_url
  - email
  - role
  - created_at
- Garantir erro explícito
- Garantir ordenação por mais recentes

### Pronto quando
- Users page recebe dados reais
- Recent users pode ser alimentado da mesma fonte

### Limites
- Sem redesign de páginas
- Sem expandir para logs

---

## Task 3 — Plugar Users page e Dashboard recent users
### Objetivo
Trocar o fluxo antigo pelo novo sem mexer desnecessariamente no layout.

### Fazer
- Atualizar aba Usuários
- Atualizar bloco Usuários recentes
- Diferenciar loading/error/empty/data

### Pronto quando
- Usuários aparecem
- Usuários recentes aparecem
- Estados ficam corretos

### Limites
- Não mexer em logs
- Não refatorar admin inteiro

---

## Task 4 — Estabilização curta
### Objetivo
Garantir que o fluxo de usuários admin ficou confiável.

### Fazer
- Validar lista
- Validar recent users
- Validar empty/error states
- Corrigir pequenas arestas

### Pronto quando
- Fluxo está consistente
- Não há erro mascarado como vazio

### Limites
- Sem nova feature
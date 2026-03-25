# Tasks — Fornecedores Admin MVP

## Task 1 — Ajustar modelo de fornecedor para status
### Objetivo
Evoluir o modelo atual para suportar `pending | approved | rejected` sem quebrar a listagem pública.

### Fazer
- Inspecionar se hoje existe `is_approved`, `status` ou ambos
- Definir estratégia mínima de compatibilidade
- Criar migration conservadora
- Garantir que a listagem pública continue mostrando apenas aprovados

### Pronto quando
- Banco suporta status claramente
- Não há quebra na página pública
- Há caminho limpo para aprovação/rejeição

### Limites
- Não mexer em reviews
- Não mexer em UI pública além do necessário para compatibilidade

---

## Task 2 — Criar formulário admin de fornecedor
### Objetivo
Permitir que admin cadastre e edite fornecedor.

### Fazer
- Criar form com campos mínimos
- Reaproveitar padrão visual existente
- Validar links e campos obrigatórios mínimos
- Suportar create e edit

### Pronto quando
- Admin consegue criar fornecedor
- Admin consegue editar fornecedor
- Form está funcional e reutilizável

### Limites
- Sem upload avançado além do necessário
- Sem autosave
- Sem complexidade de UX extra

---

## Task 3 — Exibir botão admin na aba Fornecedores
### Objetivo
Dar acesso rápido ao cadastro a partir da própria aba.

### Fazer
- Exibir botão `Cadastrar fornecedor` no canto superior direito
- Mostrar apenas para admin
- Abrir form de cadastro

### Pronto quando
- Admin vê o botão
- Usuário comum não vê
- Ação abre fluxo funcional

### Limites
- Não criar múltiplos pontos de entrada desnecessários

---

## Task 4 — Criar área admin de gestão de fornecedores
### Objetivo
Permitir moderar fornecedores em um local administrativo simples.

### Fazer
- Criar tela/área admin mínima
- Listar fornecedores com status
- Adicionar ações:
  - aprovar
  - rejeitar
  - editar

### Pronto quando
- Admin consegue moderar fornecedores
- Status muda corretamente
- Página pública reflete apenas aprovados

### Limites
- Sem dashboard complexo
- Sem métricas
- Sem filtros avançados nessa fase

---

## Task 5 — Preparar extensão futura para indicação por usuário
### Objetivo
Deixar a base pronta para futura feature sem implementá-la agora.

### Fazer
- Garantir que o modelo aceite fornecedor pendente
- Garantir que permissões não bloqueiem futura extensão
- Documentar que usuário comum ainda não pode indicar nesta fase

### Pronto quando
- Futuro fluxo pode ser adicionado sem redesenhar o banco
- Escopo atual permanece enxuto

### Limites
- Não implementar UI de indicação agora
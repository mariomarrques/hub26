

# Plano: Nova Navbar Tubelight + Pagina de Videos + Links Admin

## Resumo

Substituir o header atual (hamburger + sidebar) por uma navbar centralizada estilo "tubelight" com menus dropdown, adicionar uma nova pagina de Videos, e criar um painel admin para gerenciar os links externos.

---

## 1. Instalar dependencia

- Adicionar `framer-motion` ao projeto (necessario para a animacao tubelight)

## 2. Criar componente TubelightNavbar

**Arquivo:** `src/components/ui/tubelight-navbar.tsx`

- Adaptar o componente do prompt de Next.js para React Router (trocar `Link` de next por `Link` de react-router-dom, remover `"use client"`)
- A navbar fica centralizada na tela, fixa no topo
- Layout: **Logo (esquerda)** | **Itens centrais (CSSBuy, Catalogo, Videos, Suporte)** | **Acoes usuario (direita)**
- O item ativo recebe o efeito "tubelight" (glow animado abaixo)
- Responsivo: em mobile, os itens mostram apenas icones

## 3. Estrutura dos itens da navbar

| Item | Tipo | Hover/Click |
|------|------|-------------|
| Logo Hub 26 | Link para `/` | Sem dropdown |
| CSSBuy (China) | Dropdown | "Aulas" (link externo) + "Produtos Indicados" (link interno `/produtos`) |
| Catalogo | Dropdown | Grid 2 colunas com categorias (ex: Copa do Mundo, Brasileirao, Lancamentos, La Liga, Premier League, Bundesliga, NBA, Jaquetas) -- todos links externos com badge de link externo |
| Videos | Link interno | Navega para `/videos` |
| Suporte | Link externo | Abre link WhatsApp (configuravel) com badge de link externo |

- Todos os links externos mostram o icone `ExternalLink` ao lado do texto
- "Produtos Indicados" e um link interno, sem badge externo

## 4. Dropdowns dos itens

- Usar componentes Radix `NavigationMenu` ja existente no projeto para os dropdowns (hover-triggered)
- **CSSBuy dropdown:** 2 itens em coluna simples
- **Catalogo dropdown:** Grid 2 colunas (como na referencia anexada) com os itens de categoria, cada um com icone de link externo
- Background escuro, alinhado a identidade visual do Hub 26

## 5. Area direita da navbar

Manter no canto direito:
- Toggle tema (sol/lua)
- Notificacoes (sino)
- Avatar do usuario com dropdown (Perfil, Configuracoes, Sair)

## 6. Remover Sidebar

- Remover `AppSidebar.tsx` do layout
- Remover `SidebarContext.tsx` (toggle/hamburger nao sera mais necessario)
- Simplificar `AppLayout.tsx`: remover sidebar, remover hamburger do header
- O `main` content nao precisa mais de offset lateral

## 7. Renomear "Produtos" para "Produtos Indicados"

- Em `Index.tsx`: mudar titulo da pagina de "Produtos" para "Produtos Indicados"
- Na rota continua sendo `/produtos`

## 8. Nova pagina: Videos

**Arquivo:** `src/pages/Videos.tsx`

Baseada na referencia visual enviada:
- Titulo: "Biblioteca de **Videos**" (destaque em cor primaria)
- Subtitulo descritivo
- Barra de busca por titulo/nome
- Secao de filtros colapsavel (Categoria, Time, Kit, Ano, Versao, Campeonato) com botoes "Aplicar" e "Limpar filtros"
- Grid de cards de video (3 colunas desktop, 2 tablet, 1 mobile)
- Cada card:
  - Thumbnail com botao play central
  - Badge "Baixar" no canto superior direito
  - Titulo do arquivo abaixo
- Estados: loading (skeletons), empty, error

**Tabela no banco:** `videos`
- `id` (uuid, PK)
- `title` (text)
- `description` (text, nullable)
- `video_url` (text) -- URL do arquivo
- `thumbnail_url` (text, nullable)
- `category` (text, nullable)
- `tags` (text[], nullable)
- `created_at` (timestamptz)
- `created_by` (uuid, ref profiles)
- RLS: leitura para todos autenticados, escrita para admins

**Rota:** `/videos` (protegida, dentro do AppLayout)

## 9. Tabela de links configuraveis (Admin)

**Tabela no banco:** `nav_links`
- `id` (uuid, PK)
- `key` (text, unique) -- identificador (ex: "cssbuy_aulas", "suporte_whatsapp", "catalogo_copa_do_mundo")
- `label` (text) -- nome exibido
- `url` (text, nullable) -- URL de destino
- `is_external` (boolean, default true)
- `position` (text) -- "cssbuy" | "catalogo" | "suporte"
- `sort_order` (int, default 0)
- `updated_at` (timestamptz)
- RLS: leitura para todos autenticados, escrita para admins

**Pagina admin:** `src/pages/admin/AdminNavLinks.tsx`
- Tabela listando todos os links agrupados por posicao
- Editar URL de cada link
- Adicionar/remover itens do catalogo
- Rota: `/admin/links`

**Hook:** `src/hooks/use-nav-links.ts`
- Query para buscar todos os links
- Mutations para atualizar URLs

## 10. Seed dos links iniciais

Inserir na migration os links padroes com URL vazia:
- cssbuy_aulas (CSSBuy > Aulas)
- catalogo_copa_do_mundo, catalogo_brasileirao, catalogo_lancamentos, catalogo_la_liga, catalogo_premier_league, catalogo_bundesliga, catalogo_nba, catalogo_jaquetas
- suporte_whatsapp

## 11. Atualizar rotas (App.tsx)

- Adicionar rota `/videos` (protegida)
- Adicionar rota `/admin/links` (protegida, admin)
- Manter todas as rotas existentes

## 12. Atualizar Home

- Atualizar os botoes de navegacao da Home para refletir a nova estrutura:
  - "Produtos Indicados" (em vez de "Produtos")
  - "Videos" (novo)
  - Manter Fornecedores, Comunidade, Avisos

---

## Detalhes Tecnicos

### Arquivos novos:
- `src/components/ui/tubelight-navbar.tsx` -- componente base da navbar
- `src/components/layout/NavbarDropdowns.tsx` -- dropdowns de CSSBuy e Catalogo
- `src/pages/Videos.tsx` -- pagina de videos
- `src/pages/admin/AdminNavLinks.tsx` -- admin de links
- `src/hooks/use-nav-links.ts` -- hook para links configuraveis
- `src/hooks/use-videos.ts` -- hook para videos
- Migration SQL para tabelas `nav_links` e `videos`

### Arquivos modificados:
- `src/components/layout/AppHeader.tsx` -- reescrito com tubelight navbar
- `src/components/layout/AppLayout.tsx` -- remover sidebar
- `src/App.tsx` -- novas rotas
- `src/pages/Home.tsx` -- atualizar botoes
- `src/pages/Index.tsx` -- renomear titulo

### Arquivos removidos:
- `src/components/layout/AppSidebar.tsx` -- substituida pela navbar
- `src/contexts/SidebarContext.tsx` -- nao mais necessario

### Dependencias:
- `framer-motion` (nova)


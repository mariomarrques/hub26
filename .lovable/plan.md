
# Plano: Videos Independentes (sem vinculo a produtos)

## Resumo

Desacoplar completamente o sistema de videos dos produtos. Os videos passam a ser uma entidade independente, gerenciada exclusivamente pelo painel admin, e exibidos apenas na pagina `/videos`. A estrutura fica preparada para upload direto no futuro.

---

## 1. Banco de dados

A tabela `product_videos` sera substituida por uma nova tabela `hub_videos` com campos pensados para o fluxo independente e futuro upload:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | uuid (PK) | Identificador unico |
| title | text | Nome exibido ao usuario |
| original_filename | text, nullable | Nome original do arquivo (para futuro upload) |
| panda_video_id | text, nullable | ID do video no PandaVideo |
| embed_url | text, nullable | URL de embed do PandaVideo |
| thumbnail_url | text, nullable | URL da thumbnail |
| downloadable_url | text, nullable | URL para download em Full HD |
| is_downloadable | boolean, default true | Permite download? |
| description | text, nullable | Descricao opcional |
| file_size_mb | numeric, nullable | Tamanho do arquivo (futuro) |
| upload_status | text, default 'manual' | Status: 'manual', 'uploading', 'processing', 'ready', 'error' (preparado para upload futuro) |
| sort_order | integer, default 0 | Ordenacao |
| created_at | timestamptz | Data de criacao |
| created_by | uuid, nullable | Quem adicionou |

RLS: leitura para autenticados, escrita para admins/moderadores.

Migration tambem remove a tabela `product_videos`.

## 2. Remover vinculo de videos com produtos

### Arquivos a remover/limpar:
- **Remover** `src/components/admin/ProductVideoManager.tsx`
- **Remover** `src/components/videos/ProductVideoSection.tsx`
- **Remover** `src/hooks/use-product-videos.ts`

### Arquivos a editar:
- **`src/components/admin/ProductFormDialog.tsx`** -- remover import e uso do `ProductVideoManager`
- **`src/pages/Produto.tsx`** -- remover import e uso do `ProductVideoSection`

## 3. Novo hook: `use-hub-videos.ts`

- Query para listar todos os videos (`hub_videos`) ordenados por `sort_order` e `created_at`
- Mutations: criar, atualizar e deletar videos
- Tipo `HubVideo` com todos os campos da tabela
- Preparado com campo `upload_status` para fluxo futuro de upload

## 4. Nova pagina admin: `AdminVideos.tsx`

Pagina dedicada no painel admin (`/admin/videos`) para gerenciar videos:

- Tabela listando todos os videos com: thumbnail (miniatura), titulo, nome original, status de download, acoes
- Botao "Adicionar Video" que abre dialog com formulario:
  - Titulo (obrigatorio)
  - Nome original do arquivo (opcional, para referencia)
  - Panda Video ID (opcional)
  - Embed URL (opcional)
  - Thumbnail URL (opcional)
  - URL de Download (opcional)
  - Descricao (opcional)
  - Toggle "Permitir download"
- Acoes por video: editar, excluir
- Area de upload desabilitada com badge "Em breve" (preparando para o futuro)

### Adicionar aba "Videos" no admin:
- **`src/components/admin/AdminLayout.tsx`** -- adicionar tab `/admin/videos` com icone `Video`

## 5. Atualizar pagina Videos (`/videos`)

- Trocar de `useAllProductVideos` para `useHubVideos`
- Remover qualquer referencia a "produto relacionado" nos cards
- Filtro de busca apenas por titulo/descricao
- Cards mostram: thumbnail, play, badge HD, titulo
- Modal PandaVideo com botao "Baixar em Full HD"

## 6. Atualizar componentes de video

- **`VideoCard.tsx`** -- trocar tipo de `ProductVideo` para `HubVideo`, remover prop `productName`
- **`PandaVideoModal.tsx`** -- trocar tipo de `ProductVideo` para `HubVideo`

## 7. Rota nova no App.tsx

- Adicionar rota `/admin/videos` protegida com role admin

---

## Detalhes Tecnicos

### Arquivos novos:
- `src/hooks/use-hub-videos.ts`
- `src/pages/admin/AdminVideos.tsx`
- Migration SQL (criar `hub_videos`, dropar `product_videos`)

### Arquivos editados:
- `src/components/admin/AdminLayout.tsx` (nova aba)
- `src/components/admin/ProductFormDialog.tsx` (remover video manager)
- `src/pages/Produto.tsx` (remover video section)
- `src/pages/Videos.tsx` (usar novo hook)
- `src/components/videos/VideoCard.tsx` (novo tipo)
- `src/components/videos/PandaVideoModal.tsx` (novo tipo)
- `src/App.tsx` (nova rota admin)

### Arquivos removidos:
- `src/components/admin/ProductVideoManager.tsx`
- `src/components/videos/ProductVideoSection.tsx`
- `src/hooks/use-product-videos.ts`

### Preparacao para upload futuro:
- Campo `upload_status` na tabela com estados definidos
- Campo `original_filename` para rastrear o arquivo original
- Campo `file_size_mb` para controle
- Area de upload na UI do admin com placeholder "Em breve"
- Quando implementado, o fluxo sera: upload local -> envio para PandaVideo via API -> salvar `panda_video_id` + `downloadable_url` automaticamente

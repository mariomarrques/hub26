-- Adicionar coluna parent_id para threading de comentários
ALTER TABLE public.post_comments 
ADD COLUMN parent_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE;

-- Índice para buscar respostas rapidamente
CREATE INDEX idx_post_comments_parent_id ON public.post_comments(parent_id);
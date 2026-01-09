-- Tabela de comentários
CREATE TABLE public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de likes
CREATE TABLE public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- RLS para comentários
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View comments on approved posts"
  ON public.post_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.community_posts 
    WHERE id = post_id AND status = 'approved'
  ));

CREATE POLICY "Users can create comments"
  ON public.post_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments"
  ON public.post_comments FOR DELETE
  USING (author_id = auth.uid());

CREATE POLICY "Admins can delete any comment"
  ON public.post_comments FOR DELETE
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- RLS para likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
  ON public.post_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like posts"
  ON public.post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own likes"
  ON public.post_likes FOR DELETE
  USING (user_id = auth.uid());

-- Trigger para atualizar updated_at nos comentários
CREATE TRIGGER update_post_comments_updated_at
  BEFORE UPDATE ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para notificar autor do post quando recebe comentário
CREATE OR REPLACE FUNCTION public.notify_post_author_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_author_id UUID;
  commenter_name TEXT;
  post_title TEXT;
BEGIN
  SELECT author_id, title INTO post_author_id, post_title
  FROM public.community_posts
  WHERE id = NEW.post_id;
  
  SELECT name INTO commenter_name
  FROM public.profiles
  WHERE id = NEW.author_id;
  
  IF post_author_id != NEW.author_id THEN
    INSERT INTO public.notifications (user_id, type, title, message, link, sender_id)
    VALUES (
      post_author_id,
      'community',
      'Novo comentário no seu tópico',
      COALESCE(commenter_name, 'Alguém') || ' comentou em "' || LEFT(post_title, 50) || '"',
      '/comunidade',
      NEW.author_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_comment_created
  AFTER INSERT ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_post_author_on_comment();
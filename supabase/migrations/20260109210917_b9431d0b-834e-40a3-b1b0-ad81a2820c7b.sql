
-- Criar tabela de preferências de notificação
CREATE TABLE public.user_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  new_products BOOLEAN NOT NULL DEFAULT true,
  bazar_alerts BOOLEAN NOT NULL DEFAULT false,
  community_messages BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver suas preferências"
  ON public.user_notification_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas preferências"
  ON public.user_notification_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas preferências"
  ON public.user_notification_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_user_notification_settings_updated_at
  BEFORE UPDATE ON public.user_notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para notificar sobre novos produtos
CREATE OR REPLACE FUNCTION public.notify_new_product()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  product_category_name TEXT;
BEGIN
  -- Buscar nome da categoria
  SELECT name INTO product_category_name
  FROM public.categories
  WHERE id = NEW.category_id;

  -- Inserir notificação para usuários com new_products = true
  -- Exclui o próprio criador do produto
  INSERT INTO public.notifications (user_id, type, title, message, link, sender_id)
  SELECT 
    uns.user_id,
    'product'::notification_type,
    'Novo Produto: ' || NEW.name,
    'Um novo produto foi adicionado' || 
      CASE WHEN product_category_name IS NOT NULL 
        THEN ' na categoria ' || product_category_name 
        ELSE '' 
      END || '. Confira!',
    '/produto/' || NEW.id,
    NEW.created_by
  FROM public.user_notification_settings uns
  WHERE uns.new_products = true
    AND uns.user_id != COALESCE(NEW.created_by, '00000000-0000-0000-0000-000000000000');

  -- Também notifica usuários que não têm configuração (padrão é true)
  INSERT INTO public.notifications (user_id, type, title, message, link, sender_id)
  SELECT 
    p.id,
    'product'::notification_type,
    'Novo Produto: ' || NEW.name,
    'Um novo produto foi adicionado' || 
      CASE WHEN product_category_name IS NOT NULL 
        THEN ' na categoria ' || product_category_name 
        ELSE '' 
      END || '. Confira!',
    '/produto/' || NEW.id,
    NEW.created_by
  FROM public.profiles p
  WHERE p.id != COALESCE(NEW.created_by, '00000000-0000-0000-0000-000000000000')
    AND NOT EXISTS (
      SELECT 1 FROM public.user_notification_settings uns 
      WHERE uns.user_id = p.id
    );

  RETURN NEW;
END;
$$;

-- Trigger para novos produtos
CREATE TRIGGER on_product_created
  AFTER INSERT ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_product();

-- Atualizar função de comentários para respeitar preferências
CREATE OR REPLACE FUNCTION public.notify_post_author_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  post_author_id UUID;
  commenter_name TEXT;
  post_title TEXT;
  user_wants_notification BOOLEAN;
BEGIN
  -- Buscar dados do post
  SELECT author_id, title INTO post_author_id, post_title
  FROM public.community_posts
  WHERE id = NEW.post_id;
  
  -- Verificar preferência do usuário
  SELECT community_messages INTO user_wants_notification
  FROM public.user_notification_settings
  WHERE user_id = post_author_id;
  
  -- Se não tem configuração, assume true (padrão)
  IF user_wants_notification IS NULL THEN
    user_wants_notification := true;
  END IF;
  
  SELECT name INTO commenter_name
  FROM public.profiles
  WHERE id = NEW.author_id;
  
  -- Só envia se usuário quer e não é o próprio autor
  IF post_author_id != NEW.author_id AND user_wants_notification THEN
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

-- Atualizar função de menções para respeitar preferências
CREATE OR REPLACE FUNCTION public.notify_mentioned_users()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  mentioned_name TEXT;
  mentioned_user_id UUID;
  commenter_name TEXT;
  post_title TEXT;
  user_wants_notification BOOLEAN;
BEGIN
  -- Buscar nome do comentarista
  SELECT name INTO commenter_name
  FROM public.profiles
  WHERE id = NEW.author_id;
  
  -- Buscar título do post
  SELECT title INTO post_title
  FROM public.community_posts
  WHERE id = NEW.post_id;
  
  -- Encontrar todas as menções (@username)
  FOR mentioned_name IN 
    SELECT DISTINCT (regexp_matches(NEW.content, '@(\w+)', 'g'))[1]
  LOOP
    -- Buscar ID do usuário mencionado pelo nome
    SELECT id INTO mentioned_user_id
    FROM public.profiles
    WHERE LOWER(name) = LOWER(mentioned_name)
    LIMIT 1;
    
    -- Verificar preferência do usuário
    IF mentioned_user_id IS NOT NULL THEN
      SELECT community_messages INTO user_wants_notification
      FROM public.user_notification_settings
      WHERE user_id = mentioned_user_id;
      
      IF user_wants_notification IS NULL THEN
        user_wants_notification := true;
      END IF;
    END IF;
    
    -- Se encontrou o usuário, não é o próprio autor e quer notificações
    IF mentioned_user_id IS NOT NULL AND mentioned_user_id != NEW.author_id AND user_wants_notification THEN
      INSERT INTO public.notifications (user_id, type, title, message, link, sender_id)
      VALUES (
        mentioned_user_id,
        'mention',
        'Você foi mencionado',
        COALESCE(commenter_name, 'Alguém') || ' mencionou você em "' || LEFT(COALESCE(post_title, 'um tópico'), 40) || '"',
        '/comunidade',
        NEW.author_id
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Atualizar função de respostas a comentários
CREATE OR REPLACE FUNCTION public.notify_comment_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  parent_comment_author_id UUID;
  replier_name TEXT;
  post_title TEXT;
  user_wants_notification BOOLEAN;
BEGIN
  -- Só executa se for uma resposta (parent_id não nulo)
  IF NEW.parent_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Buscar autor do comentário pai
  SELECT author_id INTO parent_comment_author_id
  FROM public.post_comments
  WHERE id = NEW.parent_id;
  
  -- Verificar preferência do usuário
  SELECT community_messages INTO user_wants_notification
  FROM public.user_notification_settings
  WHERE user_id = parent_comment_author_id;
  
  IF user_wants_notification IS NULL THEN
    user_wants_notification := true;
  END IF;
  
  -- Buscar nome de quem respondeu
  SELECT name INTO replier_name
  FROM public.profiles
  WHERE id = NEW.author_id;
  
  -- Buscar título do post
  SELECT title INTO post_title
  FROM public.community_posts
  WHERE id = NEW.post_id;
  
  -- Notifica apenas se quem respondeu não é o autor do comentário e quer notificações
  IF parent_comment_author_id IS NOT NULL 
     AND parent_comment_author_id != NEW.author_id 
     AND user_wants_notification THEN
    INSERT INTO public.notifications (user_id, type, title, message, link, sender_id)
    VALUES (
      parent_comment_author_id,
      'community',
      'Nova resposta ao seu comentário',
      COALESCE(replier_name, 'Alguém') || ' respondeu ao seu comentário em "' || LEFT(COALESCE(post_title, 'um tópico'), 40) || '"',
      '/comunidade',
      NEW.author_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Atualizar função de menções em posts
CREATE OR REPLACE FUNCTION public.notify_mentioned_users_in_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  mentioned_name TEXT;
  mentioned_user_id UUID;
  author_name TEXT;
  user_wants_notification BOOLEAN;
BEGIN
  -- Buscar nome do autor
  SELECT name INTO author_name
  FROM public.profiles
  WHERE id = NEW.author_id;
  
  -- Encontrar todas as menções (@username) no conteúdo
  FOR mentioned_name IN 
    SELECT DISTINCT (regexp_matches(NEW.content, '@(\w+)', 'g'))[1]
  LOOP
    -- Buscar ID do usuário mencionado
    SELECT id INTO mentioned_user_id
    FROM public.profiles
    WHERE LOWER(name) = LOWER(mentioned_name)
    LIMIT 1;
    
    -- Verificar preferência do usuário
    IF mentioned_user_id IS NOT NULL THEN
      SELECT community_messages INTO user_wants_notification
      FROM public.user_notification_settings
      WHERE user_id = mentioned_user_id;
      
      IF user_wants_notification IS NULL THEN
        user_wants_notification := true;
      END IF;
    END IF;
    
    -- Se encontrou o usuário, não é o próprio autor e quer notificações
    IF mentioned_user_id IS NOT NULL AND mentioned_user_id != NEW.author_id AND user_wants_notification THEN
      INSERT INTO public.notifications (user_id, type, title, message, link, sender_id)
      VALUES (
        mentioned_user_id,
        'mention',
        'Você foi mencionado',
        COALESCE(author_name, 'Alguém') || ' mencionou você no tópico "' || LEFT(NEW.title, 40) || '"',
        '/comunidade',
        NEW.author_id
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

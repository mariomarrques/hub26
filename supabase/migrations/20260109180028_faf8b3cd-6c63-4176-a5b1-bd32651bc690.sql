-- Adicionar tipo 'mention' ao enum notification_type se não existir
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'mention';

-- Função para notificar usuários mencionados em comentários
CREATE OR REPLACE FUNCTION public.notify_mentioned_users()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mentioned_name TEXT;
  mentioned_user_id UUID;
  commenter_name TEXT;
  post_title TEXT;
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
    
    -- Se encontrou o usuário e não é o próprio autor
    IF mentioned_user_id IS NOT NULL AND mentioned_user_id != NEW.author_id THEN
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

-- Trigger após inserir comentário
DROP TRIGGER IF EXISTS on_comment_mention ON public.post_comments;
CREATE TRIGGER on_comment_mention
  AFTER INSERT ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_mentioned_users();
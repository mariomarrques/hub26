-- Função para notificar autor do comentário quando alguém responde
CREATE OR REPLACE FUNCTION public.notify_comment_reply()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  parent_comment_author_id UUID;
  replier_name TEXT;
  post_title TEXT;
BEGIN
  -- Só executa se for uma resposta (parent_id não nulo)
  IF NEW.parent_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Buscar autor do comentário pai
  SELECT author_id INTO parent_comment_author_id
  FROM public.post_comments
  WHERE id = NEW.parent_id;
  
  -- Buscar nome de quem respondeu
  SELECT name INTO replier_name
  FROM public.profiles
  WHERE id = NEW.author_id;
  
  -- Buscar título do post
  SELECT title INTO post_title
  FROM public.community_posts
  WHERE id = NEW.post_id;
  
  -- Notifica apenas se quem respondeu não é o autor do comentário
  IF parent_comment_author_id IS NOT NULL 
     AND parent_comment_author_id != NEW.author_id THEN
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
$function$;

-- Criar trigger para notificar respostas a comentários
CREATE TRIGGER on_comment_reply
  AFTER INSERT ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_comment_reply();
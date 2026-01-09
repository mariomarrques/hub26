-- Adicionar novos tipos de notificação ao enum
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'post_approved';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'post_rejected';

-- Função para notificar autor quando status do post muda
CREATE OR REPLACE FUNCTION public.notify_post_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Post foi aprovado
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    INSERT INTO public.notifications (user_id, type, title, message, link, sender_id)
    VALUES (
      NEW.author_id,
      'post_approved',
      'Post Aprovado!',
      'Seu tópico "' || LEFT(NEW.title, 40) || '" foi aprovado e já está visível na comunidade.',
      '/comunidade',
      NEW.approved_by
    );
  END IF;
  
  -- Post foi rejeitado
  IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    INSERT INTO public.notifications (user_id, type, title, message, link, sender_id)
    VALUES (
      NEW.author_id,
      'post_rejected',
      'Post não aprovado',
      'Seu tópico "' || LEFT(NEW.title, 40) || '" não foi aprovado.' || 
        CASE 
          WHEN NEW.rejection_reason IS NOT NULL AND NEW.rejection_reason != '' 
          THEN ' Motivo: ' || LEFT(NEW.rejection_reason, 100)
          ELSE ''
        END,
      '/comunidade',
      NULL
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para mudança de status
CREATE TRIGGER on_post_status_change
  AFTER UPDATE ON public.community_posts
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.notify_post_status_change();

-- Função para notificar mencionados em posts
CREATE OR REPLACE FUNCTION public.notify_mentioned_users_in_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mentioned_name TEXT;
  mentioned_user_id UUID;
  author_name TEXT;
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
    
    -- Se encontrou o usuário e não é o próprio autor
    IF mentioned_user_id IS NOT NULL AND mentioned_user_id != NEW.author_id THEN
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

-- Trigger para INSERT (posts auto-aprovados)
CREATE TRIGGER on_post_mention_insert
  AFTER INSERT ON public.community_posts
  FOR EACH ROW
  WHEN (NEW.status = 'approved')
  EXECUTE FUNCTION public.notify_mentioned_users_in_post();

-- Trigger para UPDATE (posts que são aprovados depois)
CREATE TRIGGER on_post_mention_update
  AFTER UPDATE ON public.community_posts
  FOR EACH ROW
  WHEN (OLD.status != 'approved' AND NEW.status = 'approved')
  EXECUTE FUNCTION public.notify_mentioned_users_in_post();
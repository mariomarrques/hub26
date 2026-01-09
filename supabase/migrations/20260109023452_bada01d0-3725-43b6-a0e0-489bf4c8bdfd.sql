-- Permitir admins visualizarem todas as roles
CREATE POLICY "Admins podem ver todas as roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Permitir admins atualizarem roles de outros usuarios
CREATE POLICY "Admins podem atualizar roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Funcao segura para admins buscarem email de usuarios
CREATE OR REPLACE FUNCTION public.get_user_email(target_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN NULL;
  END IF;
  
  RETURN (SELECT email FROM auth.users WHERE id = target_user_id);
END;
$$;

-- Funcao para buscar todos usuarios com roles (apenas para admins)
CREATE OR REPLACE FUNCTION public.get_all_users_with_roles()
RETURNS TABLE (
  id uuid,
  name text,
  avatar_url text,
  created_at timestamptz,
  role app_role,
  email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.avatar_url,
    p.created_at,
    ur.role,
    u.email
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id
  LEFT JOIN auth.users u ON p.id = u.id;
END;
$$;

-- Funcao para contar usuarios por role (apenas para admins)
CREATE OR REPLACE FUNCTION public.get_user_stats()
RETURNS TABLE (
  total_users bigint,
  admin_count bigint,
  moderator_count bigint,
  member_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.profiles)::bigint as total_users,
    (SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin')::bigint as admin_count,
    (SELECT COUNT(*) FROM public.user_roles WHERE role = 'moderator')::bigint as moderator_count,
    (SELECT COUNT(*) FROM public.user_roles WHERE role = 'member')::bigint as member_count;
END;
$$;

-- Funcao para enviar notificacao em massa (apenas para admins)
CREATE OR REPLACE FUNCTION public.send_bulk_notification(
  p_type notification_type,
  p_title text,
  p_message text,
  p_link text DEFAULT NULL,
  p_target_roles app_role[] DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected_count integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  INSERT INTO public.notifications (user_id, type, title, message, link, sender_id)
  SELECT 
    ur.user_id,
    p_type,
    p_title,
    p_message,
    p_link,
    auth.uid()
  FROM public.user_roles ur
  WHERE (p_target_roles IS NULL OR ur.role = ANY(p_target_roles));
  
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RETURN affected_count;
END;
$$;
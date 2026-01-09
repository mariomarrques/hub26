-- Criar enum para tipos de ação de auditoria
CREATE TYPE public.audit_action AS ENUM (
  'role_change',
  'bulk_notification',
  'user_delete',
  'settings_change'
);

-- Criar tabela de audit logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action audit_action NOT NULL,
  target_user_id UUID,
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para buscas rápidas
CREATE INDEX idx_audit_logs_admin_id ON public.audit_logs(admin_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_target_user ON public.audit_logs(target_user_id);

-- Habilitar RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver logs
CREATE POLICY "Admins podem ver todos os logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Apenas admins podem criar logs (via funções ou diretamente)
CREATE POLICY "Admins podem criar logs"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Função para registrar alteração de role (trigger)
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (admin_id, action, target_user_id, details)
  VALUES (
    auth.uid(),
    'role_change',
    NEW.user_id,
    jsonb_build_object(
      'old_role', OLD.role::text,
      'new_role', NEW.role::text
    )
  );
  RETURN NEW;
END;
$$;

-- Trigger para capturar alterações de role
CREATE TRIGGER on_role_change
  AFTER UPDATE ON public.user_roles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION public.log_role_change();

-- Atualizar send_bulk_notification para registrar log
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
  
  -- Inserir notificações
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
  
  -- Registrar no audit log
  INSERT INTO public.audit_logs (admin_id, action, details)
  VALUES (
    auth.uid(),
    'bulk_notification',
    jsonb_build_object(
      'type', p_type::text,
      'title', p_title,
      'message_preview', left(p_message, 100),
      'target_roles', p_target_roles,
      'recipients_count', affected_count
    )
  );
  
  RETURN affected_count;
END;
$$;

-- Função para buscar logs com detalhes
CREATE OR REPLACE FUNCTION public.get_audit_logs(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0,
  p_action text DEFAULT NULL,
  p_admin_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  admin_id uuid,
  admin_name text,
  action text,
  target_user_id uuid,
  target_user_name text,
  details jsonb,
  created_at timestamptz
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
    al.id,
    al.admin_id,
    ap.name as admin_name,
    al.action::text,
    al.target_user_id,
    tp.name as target_user_name,
    al.details,
    al.created_at
  FROM public.audit_logs al
  LEFT JOIN public.profiles ap ON al.admin_id = ap.id
  LEFT JOIN public.profiles tp ON al.target_user_id = tp.id
  WHERE (p_action IS NULL OR al.action::text = p_action)
    AND (p_admin_id IS NULL OR al.admin_id = p_admin_id)
  ORDER BY al.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
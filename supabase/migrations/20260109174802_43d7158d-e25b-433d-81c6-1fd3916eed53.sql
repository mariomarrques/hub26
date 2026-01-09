CREATE OR REPLACE FUNCTION public.log_role_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Só registra o log se tivermos um admin_id válido
  IF current_user_id IS NOT NULL THEN
    INSERT INTO public.audit_logs (admin_id, action, target_user_id, details)
    VALUES (
      current_user_id,
      'role_change',
      NEW.user_id,
      jsonb_build_object(
        'old_role', OLD.role::text,
        'new_role', NEW.role::text
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;
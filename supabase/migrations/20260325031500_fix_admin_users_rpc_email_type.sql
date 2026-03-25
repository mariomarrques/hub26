-- Fix: get_all_users_with_roles returning varchar(255) for email
-- while function signature expects text (column 6).
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
    u.email::text
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id
  LEFT JOIN auth.users u ON p.id = u.id;
END;
$$;

-- Minimal reliable admin users read contract.
-- Supports both full list and recent users (order + optional limit).
CREATE OR REPLACE FUNCTION public.get_admin_users(
  p_limit integer DEFAULT NULL,
  p_offset integer DEFAULT 0
)
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
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'Unauthorized',
      HINT = 'Admin role required';
  END IF;

  IF p_limit IS NULL THEN
    RETURN QUERY
    SELECT
      p.id::uuid,
      p.name::text,
      p.avatar_url::text,
      p.created_at::timestamptz,
      COALESCE(ur.role, 'member'::app_role)::app_role AS role,
      u.email::text
    FROM public.profiles p
    LEFT JOIN LATERAL (
      SELECT ur_inner.role
      FROM public.user_roles ur_inner
      WHERE ur_inner.user_id = p.id
      ORDER BY
        CASE ur_inner.role
          WHEN 'admin' THEN 3
          WHEN 'moderator' THEN 2
          ELSE 1
        END DESC,
        ur_inner.created_at DESC NULLS LAST
      LIMIT 1
    ) ur ON true
    LEFT JOIN auth.users u ON u.id = p.id
    ORDER BY p.created_at DESC NULLS LAST, p.id
    OFFSET GREATEST(COALESCE(p_offset, 0), 0);
  ELSE
    RETURN QUERY
    SELECT
      p.id::uuid,
      p.name::text,
      p.avatar_url::text,
      p.created_at::timestamptz,
      COALESCE(ur.role, 'member'::app_role)::app_role AS role,
      u.email::text
    FROM public.profiles p
    LEFT JOIN LATERAL (
      SELECT ur_inner.role
      FROM public.user_roles ur_inner
      WHERE ur_inner.user_id = p.id
      ORDER BY
        CASE ur_inner.role
          WHEN 'admin' THEN 3
          WHEN 'moderator' THEN 2
          ELSE 1
        END DESC,
        ur_inner.created_at DESC NULLS LAST
      LIMIT 1
    ) ur ON true
    LEFT JOIN auth.users u ON u.id = p.id
    ORDER BY p.created_at DESC NULLS LAST, p.id
    LIMIT GREATEST(p_limit, 0)
    OFFSET GREATEST(COALESCE(p_offset, 0), 0);
  END IF;
END;
$$;

-- ============================================================================
-- HUB 26 - SETUP COMPLETO DO BANCO DE DADOS
-- ============================================================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse seu projeto no Supabase Dashboard (https://supabase.com)
-- 2. Vá em "SQL Editor" no menu lateral
-- 3. Cole TODO este conteúdo
-- 4. Clique em "Run" (ou Ctrl+Enter)
-- 5. Aguarde a execução (pode demorar alguns segundos)
--
-- IMPORTANTE: Execute em um Supabase VAZIO (sem tabelas existentes)
-- ============================================================================


-- ============================================================================
-- PARTE 1: ENUMS (Tipos customizados)
-- ============================================================================

-- Enum para roles de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'member');

-- Enum para tipos de notificação
CREATE TYPE public.notification_type AS ENUM (
  'mention',
  'product', 
  'alert',
  'community',
  'announcement',
  'post_approved',
  'post_rejected'
);

-- Enum para tipos de ação de auditoria
CREATE TYPE public.audit_action AS ENUM (
  'role_change',
  'bulk_notification',
  'user_delete',
  'settings_change'
);


-- ============================================================================
-- PARTE 2: FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Função para verificar role (evita recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


-- ============================================================================
-- PARTE 3: TABELAS PRINCIPAIS
-- ============================================================================

-- 3.1 PROFILES (perfis de usuário)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_name ON public.profiles(name);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles" 
  ON public.profiles FOR SELECT 
  TO authenticated USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- 3.2 USER_ROLES (roles de usuário)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles" 
  ON public.user_roles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todas as roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- 3.3 CATEGORIES (categorias de produtos)
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_categories_slug ON public.categories(slug);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Admin/Mod can insert categories"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admin/Mod can update categories"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admin/Mod can delete categories"
  ON public.categories FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- 3.4 PRODUCTS (produtos)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  origin_price TEXT NOT NULL,
  resale_range TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  admin_note TEXT,
  affiliate_link TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Admin/Mod can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admin/Mod can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admin/Mod can delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- 3.5 SUPPLIERS (fornecedores)
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  categories TEXT[],
  contact TEXT,
  link TEXT,
  rating_quality INTEGER,
  rating_delivery INTEGER,
  rating_communication INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_suppliers_status ON public.suppliers(status);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved suppliers"
  ON public.suppliers FOR SELECT
  USING (status = 'approved' OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Users can insert suppliers"
  ON public.suppliers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admin/Mod can update suppliers"
  ON public.suppliers FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admin/Mod can delete suppliers"
  ON public.suppliers FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- 3.6 BAZAR_PRODUCTS (produtos do bazar)
CREATE TABLE public.bazar_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  price TEXT NOT NULL,
  original_price TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  max_stock INTEGER NOT NULL,
  is_kit BOOLEAN DEFAULT false,
  kit_items INTEGER,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.bazar_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bazar products"
  ON public.bazar_products FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert bazar products"
  ON public.bazar_products FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update bazar products"
  ON public.bazar_products FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete bazar products"
  ON public.bazar_products FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_bazar_products_updated_at
  BEFORE UPDATE ON public.bazar_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- 3.7 NOTIFICATIONS (notificações)
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications(user_id, is_read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver próprias notificações"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem marcar próprias notificações como lidas"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar próprias notificações"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins podem criar notificações para qualquer usuário"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Moderadores podem criar notificações para qualquer usuário"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Usuários podem deletar próprias notificações"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- 3.8 USER_NOTIFICATION_SETTINGS (preferências de notificação)
CREATE TABLE public.user_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  new_products BOOLEAN NOT NULL DEFAULT true,
  bazar_alerts BOOLEAN NOT NULL DEFAULT false,
  community_messages BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;

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

CREATE TRIGGER update_user_notification_settings_updated_at
  BEFORE UPDATE ON public.user_notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- 3.9 AUDIT_LOGS (logs de auditoria)
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action audit_action NOT NULL,
  target_user_id UUID,
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_admin_id ON public.audit_logs(admin_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_target_user ON public.audit_logs(target_user_id);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem ver todos os logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem criar logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- 3.10 COMMUNITY_POSTS (posts da comunidade)
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  author_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  is_pinned BOOLEAN DEFAULT false,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  approved_by UUID
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View approved or own posts"
  ON public.community_posts FOR SELECT
  USING (
    status = 'approved' 
    OR author_id = auth.uid() 
    OR public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'moderator')
  );

CREATE POLICY "Users can create posts"
  ON public.community_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own pending posts"
  ON public.community_posts FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid() AND status = 'pending')
  WITH CHECK (author_id = auth.uid() AND status = 'pending');

CREATE POLICY "Admins can update any post"
  ON public.community_posts FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Users can delete own posts"
  ON public.community_posts FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Admins and moderators can delete any post"
  ON public.community_posts FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- 3.11 POST_COMMENTS (comentários em posts)
CREATE TABLE public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_post_comments_parent_id ON public.post_comments(parent_id);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View comments on approved posts"
  ON public.post_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.community_posts 
    WHERE id = post_id AND status = 'approved'
  ));

CREATE POLICY "Users can create comments"
  ON public.post_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments"
  ON public.post_comments FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Admins can delete any comment"
  ON public.post_comments FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE TRIGGER update_post_comments_updated_at
  BEFORE UPDATE ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- 3.12 POST_LIKES (likes em posts)
CREATE TABLE public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
  ON public.post_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like posts"
  ON public.post_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own likes"
  ON public.post_likes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());


-- ============================================================================
-- PARTE 4: FUNÇÕES AVANÇADAS
-- ============================================================================

-- Função para criar perfil e role automaticamente no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member');
  
  RETURN NEW;
END;
$$;

-- Trigger para executar ao criar usuário
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Função para buscar email de usuário (apenas admins)
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


-- Função para buscar todos usuários com roles (apenas admins)
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


-- Função para estatísticas de usuários (apenas admins)
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


-- Função para enviar notificação em massa (apenas admins)
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


-- Função para buscar logs de auditoria
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


-- ============================================================================
-- PARTE 5: TRIGGERS DE NOTIFICAÇÃO
-- ============================================================================

-- Log de alteração de role
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
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
$$;

CREATE TRIGGER on_role_change
  AFTER UPDATE ON public.user_roles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION public.log_role_change();


-- Notificar autor do post quando recebe comentário
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
  SELECT author_id, title INTO post_author_id, post_title
  FROM public.community_posts
  WHERE id = NEW.post_id;
  
  SELECT community_messages INTO user_wants_notification
  FROM public.user_notification_settings
  WHERE user_id = post_author_id;
  
  IF user_wants_notification IS NULL THEN
    user_wants_notification := true;
  END IF;
  
  SELECT name INTO commenter_name
  FROM public.profiles
  WHERE id = NEW.author_id;
  
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

CREATE TRIGGER on_comment_created
  AFTER INSERT ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_post_author_on_comment();


-- Notificar usuários mencionados em comentários
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
  SELECT name INTO commenter_name
  FROM public.profiles
  WHERE id = NEW.author_id;
  
  SELECT title INTO post_title
  FROM public.community_posts
  WHERE id = NEW.post_id;
  
  FOR mentioned_name IN 
    SELECT DISTINCT (regexp_matches(NEW.content, '@(\w+)', 'g'))[1]
  LOOP
    SELECT id INTO mentioned_user_id
    FROM public.profiles
    WHERE LOWER(name) = LOWER(mentioned_name)
    LIMIT 1;
    
    IF mentioned_user_id IS NOT NULL THEN
      SELECT community_messages INTO user_wants_notification
      FROM public.user_notification_settings
      WHERE user_id = mentioned_user_id;
      
      IF user_wants_notification IS NULL THEN
        user_wants_notification := true;
      END IF;
    END IF;
    
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

CREATE TRIGGER on_comment_mention
  AFTER INSERT ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_mentioned_users();


-- Notificar autor quando status do post muda
CREATE OR REPLACE FUNCTION public.notify_post_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

CREATE TRIGGER on_post_status_change
  AFTER UPDATE ON public.community_posts
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.notify_post_status_change();


-- Notificar mencionados em posts
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
  SELECT name INTO author_name
  FROM public.profiles
  WHERE id = NEW.author_id;
  
  FOR mentioned_name IN 
    SELECT DISTINCT (regexp_matches(NEW.content, '@(\w+)', 'g'))[1]
  LOOP
    SELECT id INTO mentioned_user_id
    FROM public.profiles
    WHERE LOWER(name) = LOWER(mentioned_name)
    LIMIT 1;
    
    IF mentioned_user_id IS NOT NULL THEN
      SELECT community_messages INTO user_wants_notification
      FROM public.user_notification_settings
      WHERE user_id = mentioned_user_id;
      
      IF user_wants_notification IS NULL THEN
        user_wants_notification := true;
      END IF;
    END IF;
    
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

CREATE TRIGGER on_post_mention_insert
  AFTER INSERT ON public.community_posts
  FOR EACH ROW
  WHEN (NEW.status = 'approved')
  EXECUTE FUNCTION public.notify_mentioned_users_in_post();

CREATE TRIGGER on_post_mention_update
  AFTER UPDATE ON public.community_posts
  FOR EACH ROW
  WHEN (OLD.status != 'approved' AND NEW.status = 'approved')
  EXECUTE FUNCTION public.notify_mentioned_users_in_post();


-- Notificar resposta a comentário
CREATE OR REPLACE FUNCTION public.notify_comment_reply()
RETURNS trigger
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
  IF NEW.parent_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  SELECT author_id INTO parent_comment_author_id
  FROM public.post_comments
  WHERE id = NEW.parent_id;
  
  SELECT community_messages INTO user_wants_notification
  FROM public.user_notification_settings
  WHERE user_id = parent_comment_author_id;
  
  IF user_wants_notification IS NULL THEN
    user_wants_notification := true;
  END IF;
  
  SELECT name INTO replier_name
  FROM public.profiles
  WHERE id = NEW.author_id;
  
  SELECT title INTO post_title
  FROM public.community_posts
  WHERE id = NEW.post_id;
  
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

CREATE TRIGGER on_comment_reply
  AFTER INSERT ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_comment_reply();


-- Notificar sobre novos produtos
CREATE OR REPLACE FUNCTION public.notify_new_product()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  product_category_name TEXT;
BEGIN
  SELECT name INTO product_category_name
  FROM public.categories
  WHERE id = NEW.category_id;

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

CREATE TRIGGER on_product_created
  AFTER INSERT ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_product();


-- ============================================================================
-- PARTE 6: STORAGE BUCKETS
-- ============================================================================

-- Bucket para avatares
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatares são públicos"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Usuários podem fazer upload do próprio avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Usuários podem atualizar próprio avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Usuários podem deletar próprio avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);


-- Bucket para categorias
INSERT INTO storage.buckets (id, name, public)
VALUES ('categories', 'categories', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view category images"
ON storage.objects FOR SELECT
USING (bucket_id = 'categories');

CREATE POLICY "Admins and moderators can upload category images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'categories' AND
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
);

CREATE POLICY "Admins and moderators can delete category images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'categories' AND
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
);


-- Bucket para produtos
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

CREATE POLICY "Admin/Moderator can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'products' 
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
);

CREATE POLICY "Admin/Moderator can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'products' 
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
);

CREATE POLICY "Admin/Moderator can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'products' 
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
);


-- ============================================================================
-- PARTE 7: REALTIME (opcional)
-- ============================================================================

-- Habilitar Realtime para notificações
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Habilitar Realtime para posts da comunidade
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;


-- ============================================================================
-- SETUP COMPLETO! 
-- ============================================================================
-- 
-- Próximos passos:
-- 1. Crie um usuário no app (via tela de cadastro)
-- 2. No SQL Editor do Supabase, promova esse usuário para admin:
--
--    UPDATE public.user_roles 
--    SET role = 'admin' 
--    WHERE user_id = 'SEU-USER-ID-AQUI';
--
-- 3. Configure o .env no projeto com as credenciais do Supabase:
--    VITE_SUPABASE_URL=https://seu-projeto.supabase.co
--    VITE_SUPABASE_PUBLISHABLE_KEY=sua-anon-key
--
-- ============================================================================

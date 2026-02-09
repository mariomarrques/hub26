
-- =============================================
-- Table: nav_links (configurable navigation links)
-- =============================================
CREATE TABLE public.nav_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  label text NOT NULL,
  url text,
  is_external boolean NOT NULL DEFAULT true,
  position text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nav_links ENABLE ROW LEVEL SECURITY;

-- Read: all authenticated users
CREATE POLICY "Authenticated users can view nav_links"
  ON public.nav_links FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Write: admins only
CREATE POLICY "Admins can insert nav_links"
  ON public.nav_links FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update nav_links"
  ON public.nav_links FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete nav_links"
  ON public.nav_links FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_nav_links_updated_at
  BEFORE UPDATE ON public.nav_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial links
INSERT INTO public.nav_links (key, label, url, is_external, position, sort_order) VALUES
  ('cssbuy_aulas', 'Aulas', NULL, true, 'cssbuy', 0),
  ('cssbuy_produtos', 'Produtos Indicados', '/produtos', false, 'cssbuy', 1),
  ('catalogo_copa_do_mundo', 'Copa do Mundo', NULL, true, 'catalogo', 0),
  ('catalogo_brasileirao', 'Brasileirão', NULL, true, 'catalogo', 1),
  ('catalogo_lancamentos', 'Lançamentos', NULL, true, 'catalogo', 2),
  ('catalogo_la_liga', 'La Liga', NULL, true, 'catalogo', 3),
  ('catalogo_premier_league', 'Premier League', NULL, true, 'catalogo', 4),
  ('catalogo_bundesliga', 'Bundesliga', NULL, true, 'catalogo', 5),
  ('catalogo_nba', 'NBA', NULL, true, 'catalogo', 6),
  ('catalogo_jaquetas', 'Jaquetas', NULL, true, 'catalogo', 7),
  ('suporte_whatsapp', 'Suporte', NULL, true, 'suporte', 0);

-- =============================================
-- Table: videos
-- =============================================
CREATE TABLE public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  category text,
  tags text[] DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Read: all authenticated users
CREATE POLICY "Authenticated users can view videos"
  ON public.videos FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Write: admins only
CREATE POLICY "Admins can insert videos"
  ON public.videos FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can update videos"
  ON public.videos FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can delete videos"
  ON public.videos FOR DELETE
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

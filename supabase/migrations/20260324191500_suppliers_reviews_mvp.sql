-- =============================================================================
-- Suppliers + Reviews MVP (Phase 2)
-- Conservative schema evolution: keep existing suppliers table, add missing fields,
-- introduce reviews with RLS, and prepare storage bucket for review images.
-- =============================================================================

-- 1) Suppliers: create if missing, otherwise evolve defensively
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar_url TEXT,
  country TEXT,
  shipping_method TEXT,
  prep_time TEXT,
  shipping_time TEXT,
  whatsapp_link TEXT,
  group_link TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS shipping_method TEXT,
  ADD COLUMN IF NOT EXISTS prep_time TEXT,
  ADD COLUMN IF NOT EXISTS shipping_time TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_link TEXT,
  ADD COLUMN IF NOT EXISTS group_link TEXT,
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;

-- Keep compatibility with legacy status-based approval when that column exists.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'suppliers'
      AND column_name = 'status'
  ) THEN
    EXECUTE $sql$
      UPDATE public.suppliers
      SET is_approved = COALESCE(is_approved, false) OR (status = 'approved')
      WHERE is_approved IS NULL OR status = 'approved'
    $sql$;
  END IF;
END
$$;

ALTER TABLE public.suppliers
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN is_approved SET DEFAULT false,
  ALTER COLUMN created_at SET DEFAULT now();

UPDATE public.suppliers
SET is_approved = false
WHERE is_approved IS NULL;

UPDATE public.suppliers
SET created_at = now()
WHERE created_at IS NULL;

ALTER TABLE public.suppliers
  ALTER COLUMN is_approved SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_suppliers_is_approved ON public.suppliers (is_approved);


-- 2) Reviews: create if missing and ensure required columns exist
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  image_url TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS supplier_id UUID,
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS rating INTEGER,
  ADD COLUMN IF NOT EXISTS comment TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;

-- Ensure FK exists (for pre-existing table variants)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'reviews_supplier_id_fkey'
      AND conrelid = 'public.reviews'::regclass
  ) THEN
    ALTER TABLE public.reviews
      ADD CONSTRAINT reviews_supplier_id_fkey
      FOREIGN KEY (supplier_id)
      REFERENCES public.suppliers(id)
      ON DELETE CASCADE;
  END IF;
END
$$;

-- Ensure rating check exists (for pre-existing table variants)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'reviews_rating_check'
      AND conrelid = 'public.reviews'::regclass
  ) THEN
    ALTER TABLE public.reviews
      ADD CONSTRAINT reviews_rating_check
      CHECK (rating BETWEEN 1 AND 5);
  END IF;
END
$$;

ALTER TABLE public.reviews
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN is_approved SET DEFAULT false,
  ALTER COLUMN created_at SET DEFAULT now();

UPDATE public.reviews
SET is_approved = false
WHERE is_approved IS NULL;

UPDATE public.reviews
SET created_at = now()
WHERE created_at IS NULL;

-- Apply NOT NULL where safe for existing installations
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.reviews WHERE supplier_id IS NULL) THEN
    ALTER TABLE public.reviews ALTER COLUMN supplier_id SET NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.reviews WHERE user_id IS NULL) THEN
    ALTER TABLE public.reviews ALTER COLUMN user_id SET NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.reviews WHERE rating IS NULL) THEN
    ALTER TABLE public.reviews ALTER COLUMN rating SET NOT NULL;
  END IF;
END
$$;

ALTER TABLE public.reviews
  ALTER COLUMN is_approved SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reviews_supplier_id ON public.reviews (supplier_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON public.reviews (is_approved);


-- 3) RLS: suppliers and reviews (admin model via has_role)
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Replace any existing suppliers policies to avoid permissive legacy behavior.
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'suppliers'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.suppliers', pol.policyname);
  END LOOP;
END
$$;

CREATE POLICY "Approved suppliers are readable"
  ON public.suppliers
  FOR SELECT
  USING (
    is_approved = true
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can insert suppliers"
  ON public.suppliers
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update suppliers"
  ON public.suppliers
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete suppliers"
  ON public.suppliers
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Replace any existing reviews policies.
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reviews'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.reviews', pol.policyname);
  END LOOP;
END
$$;

CREATE POLICY "Approved reviews are readable"
  ON public.reviews
  FOR SELECT
  USING (
    is_approved = true
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Authenticated users can insert pending reviews"
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND is_approved = false
  );

CREATE POLICY "Admins can update reviews"
  ON public.reviews
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete reviews"
  ON public.reviews
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));


-- 4) Storage prep for review images (project already manages buckets/policies via SQL)
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can view review images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload review images" ON storage.objects;
DROP POLICY IF EXISTS "Users/Admin can update review images" ON storage.objects;
DROP POLICY IF EXISTS "Users/Admin can delete review images" ON storage.objects;

CREATE POLICY "Anyone can view review images"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-images');

CREATE POLICY "Authenticated users can upload review images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'review-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users/Admin can update review images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'review-images'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin')
  )
)
WITH CHECK (
  bucket_id = 'review-images'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Users/Admin can delete review images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'review-images'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin')
  )
);

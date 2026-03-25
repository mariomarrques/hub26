-- =============================================================================
-- Suppliers status evolution (Task 1)
-- Additive + backward compatible:
-- - Introduce/normalize suppliers.status (pending|approved|rejected)
-- - Keep suppliers.is_approved for existing listing compatibility
-- - Update public read RLS to accept status-based approval
-- =============================================================================

-- Ensure suppliers table has both compatibility columns.
ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN;

-- Keep defaults explicit for forward inserts.
ALTER TABLE public.suppliers
  ALTER COLUMN status SET DEFAULT 'pending',
  ALTER COLUMN is_approved SET DEFAULT false;

-- Backfill/normalize status defensively:
-- - Keep already-valid values
-- - Fallback to legacy is_approved mapping
UPDATE public.suppliers
SET status = CASE
  WHEN status IN ('pending', 'approved', 'rejected') THEN status
  WHEN is_approved IS TRUE THEN 'approved'
  ELSE 'pending'
END
WHERE status IS NULL
   OR status NOT IN ('pending', 'approved', 'rejected');

-- Compatibility alignment so old filters continue to work:
-- status='approved' <-> is_approved=true
UPDATE public.suppliers
SET is_approved = (status = 'approved')
WHERE is_approved IS DISTINCT FROM (status = 'approved');

-- Enforce final shape after data normalization.
ALTER TABLE public.suppliers
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN is_approved SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'suppliers_status_allowed_check'
      AND conrelid = 'public.suppliers'::regclass
  ) THEN
    ALTER TABLE public.suppliers
      ADD CONSTRAINT suppliers_status_allowed_check
      CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_suppliers_status ON public.suppliers (status);

-- RLS read policy update:
-- allow approved suppliers via new status model, while preserving legacy approval
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'suppliers'
      AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.suppliers', pol.policyname);
  END LOOP;
END
$$;

CREATE POLICY "Approved suppliers are readable (status aware)"
  ON public.suppliers
  FOR SELECT
  USING (
    status = 'approved'
    OR is_approved = true
    OR public.has_role(auth.uid(), 'admin')
  );

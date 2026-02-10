
-- Create hub_videos table (independent from products)
CREATE TABLE public.hub_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  original_filename text,
  panda_video_id text,
  embed_url text,
  thumbnail_url text,
  downloadable_url text,
  is_downloadable boolean NOT NULL DEFAULT true,
  description text,
  file_size_mb numeric,
  upload_status text NOT NULL DEFAULT 'manual',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

-- Enable RLS
ALTER TABLE public.hub_videos ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view
CREATE POLICY "Authenticated users can view hub videos"
ON public.hub_videos FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Admins/moderators can insert
CREATE POLICY "Admins can insert hub videos"
ON public.hub_videos FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

-- Admins/moderators can update
CREATE POLICY "Admins can update hub videos"
ON public.hub_videos FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

-- Admins/moderators can delete
CREATE POLICY "Admins can delete hub videos"
ON public.hub_videos FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

-- Drop old product_videos table
DROP TABLE IF EXISTS public.product_videos;

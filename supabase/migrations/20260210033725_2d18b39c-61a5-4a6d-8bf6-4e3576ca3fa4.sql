
-- Create product_videos table for PandaVideo integration
CREATE TABLE public.product_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  panda_video_id TEXT,
  embed_url TEXT,
  thumbnail_url TEXT,
  downloadable_url TEXT,
  is_downloadable BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS
ALTER TABLE public.product_videos ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view
CREATE POLICY "Authenticated users can view product videos"
ON public.product_videos FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Admins/moderators can insert
CREATE POLICY "Admins can insert product videos"
ON public.product_videos FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

-- Admins/moderators can update
CREATE POLICY "Admins can update product videos"
ON public.product_videos FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

-- Admins/moderators can delete
CREATE POLICY "Admins can delete product videos"
ON public.product_videos FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

-- Index for faster product lookups
CREATE INDEX idx_product_videos_product_id ON public.product_videos(product_id);

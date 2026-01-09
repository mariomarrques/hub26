-- Create community_posts table
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

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view approved posts, authors can see their own, admins/mods can see all
CREATE POLICY "View approved or own posts"
  ON public.community_posts FOR SELECT
  USING (
    status = 'approved' 
    OR author_id = auth.uid() 
    OR has_role(auth.uid(), 'admin') 
    OR has_role(auth.uid(), 'moderator')
  );

-- Policy: Authenticated users can create posts
CREATE POLICY "Users can create posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Policy: Authors can update own pending posts
CREATE POLICY "Users can update own pending posts"
  ON public.community_posts FOR UPDATE
  USING (author_id = auth.uid() AND status = 'pending')
  WITH CHECK (author_id = auth.uid() AND status = 'pending');

-- Policy: Admins/Mods can update any post (approve/reject)
CREATE POLICY "Admins can update any post"
  ON public.community_posts FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

-- Policy: Users can delete own posts
CREATE POLICY "Users can delete own posts"
  ON public.community_posts FOR DELETE
  USING (author_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for posts
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
-- Permitir que admins e moderadores deletem qualquer post
CREATE POLICY "Admins and moderators can delete any post"
  ON public.community_posts
  FOR DELETE
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'moderator'::app_role)
  );
-- Criar bucket para imagens de categorias
INSERT INTO storage.buckets (id, name, public)
VALUES ('categories', 'categories', true);

-- Politica: Todos podem ver imagens de categorias
CREATE POLICY "Anyone can view category images"
ON storage.objects FOR SELECT
USING (bucket_id = 'categories');

-- Politica: Admins e moderadores podem fazer upload
CREATE POLICY "Admins and moderators can upload category images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'categories' AND
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
);

-- Politica: Admins e moderadores podem deletar
CREATE POLICY "Admins and moderators can delete category images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'categories' AND
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
);

-- Seed de categorias iniciais
INSERT INTO categories (name, slug, image, description) VALUES
  ('Camisas', 'camisas', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800', 'Polos, camisetas e streetwear'),
  ('Calçados', 'calcados', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', 'Tênis e sapatos de grife'),
  ('Acessórios', 'acessorios', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', 'Relógios, cintos e carteiras'),
  ('Bolsas', 'bolsas', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800', 'Mochilas e bolsas de mão'),
  ('Bonés', 'bones', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800', 'Bonés e chapéus'),
  ('Óculos', 'oculos', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800', 'Óculos de sol e grau');
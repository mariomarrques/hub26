-- Create products storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for products bucket
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

CREATE POLICY "Admin/Moderator can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' 
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'))
);

CREATE POLICY "Admin/Moderator can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products' 
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'))
);

CREATE POLICY "Admin/Moderator can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' 
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'))
);

-- Insert example products
INSERT INTO products (name, image, origin_price, resale_range, status, category_id, admin_note, affiliate_link) VALUES
-- Acessórios (6657708d-689a-461f-b14e-0ca894dfbabd)
('Relógio Minimalista', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 'R$ 45,00', 'R$ 89 - R$ 129', 'hot', '6657708d-689a-461f-b14e-0ca894dfbabd', 'Alta margem de lucro, muito procurado', NULL),
('Pulseira de Couro', 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400', 'R$ 12,00', 'R$ 35 - R$ 55', 'new', '6657708d-689a-461f-b14e-0ca894dfbabd', NULL, NULL),

-- Bolsas (64b6d716-db0e-42d2-93eb-8628f70fbe75)
('Bolsa Transversal', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400', 'R$ 38,00', 'R$ 79 - R$ 119', 'trending', '64b6d716-db0e-42d2-93eb-8628f70fbe75', 'Modelo unissex, boa saída', NULL),
('Mochila Executiva', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 'R$ 55,00', 'R$ 129 - R$ 189', 'hot', '64b6d716-db0e-42d2-93eb-8628f70fbe75', 'Ideal para notebook', NULL),

-- Bonés (de6bc824-1702-4182-9622-78e3238364f3)
('Boné Snapback', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400', 'R$ 15,00', 'R$ 45 - R$ 69', 'new', 'de6bc824-1702-4182-9622-78e3238364f3', NULL, NULL),
('Boné Trucker', 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400', 'R$ 18,00', 'R$ 49 - R$ 75', 'trending', 'de6bc824-1702-4182-9622-78e3238364f3', 'Ótimo para verão', NULL),

-- Calçados (3c3df7e6-beea-4f42-8b51-e6feda6c0860)
('Tênis Casual', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 'R$ 65,00', 'R$ 149 - R$ 199', 'hot', '3c3df7e6-beea-4f42-8b51-e6feda6c0860', 'Muito vendido, vários tamanhos', NULL),
('Sapatênis Premium', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400', 'R$ 48,00', 'R$ 119 - R$ 159', 'new', '3c3df7e6-beea-4f42-8b51-e6feda6c0860', NULL, NULL),

-- Camisas (b9fe52dc-c359-4abd-a1b2-f387750b27c5)
('Camisa Social Slim', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', 'R$ 28,00', 'R$ 69 - R$ 99', 'trending', 'b9fe52dc-c359-4abd-a1b2-f387750b27c5', 'Modelagem slim fit', NULL),
('Polo Básica', 'https://images.unsplash.com/photo-1625910513413-5fc42b6bddbf?w=400', 'R$ 22,00', 'R$ 59 - R$ 89', 'new', 'b9fe52dc-c359-4abd-a1b2-f387750b27c5', NULL, NULL),

-- Óculos (2f8d6412-f81f-47af-9173-5c79a2beada5)
('Óculos Aviador', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', 'R$ 25,00', 'R$ 69 - R$ 99', 'hot', '2f8d6412-f81f-47af-9173-5c79a2beada5', 'Clássico, nunca sai de moda', NULL),
('Óculos Esportivo', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400', 'R$ 20,00', 'R$ 55 - R$ 85', 'new', '2f8d6412-f81f-47af-9173-5c79a2beada5', 'Proteção UV400', NULL);
-- 1. Tabela de Categorias
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Produtos (catálogo)
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
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de Produtos do Bazar
CREATE TABLE public.bazar_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  price TEXT NOT NULL,
  original_price TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  max_stock INTEGER NOT NULL DEFAULT 100,
  is_kit BOOLEAN DEFAULT false,
  kit_items INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabela de Fornecedores
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  rating_quality NUMERIC(2,1) DEFAULT 4.0,
  rating_delivery NUMERIC(2,1) DEFAULT 4.0,
  rating_communication NUMERIC(2,1) DEFAULT 4.0,
  categories TEXT[] DEFAULT '{}',
  admin_note TEXT,
  contact TEXT,
  link TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bazar_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Categories RLS Policies
CREATE POLICY "Anyone can view categories" ON public.categories
FOR SELECT USING (true);

CREATE POLICY "Admins can insert categories" ON public.categories
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can update categories" ON public.categories
FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can delete categories" ON public.categories
FOR DELETE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

-- Products RLS Policies
CREATE POLICY "Anyone can view products" ON public.products
FOR SELECT USING (true);

CREATE POLICY "Admins can insert products" ON public.products
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can update products" ON public.products
FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can delete products" ON public.products
FOR DELETE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

-- Bazar Products RLS Policies
CREATE POLICY "Anyone can view bazar products" ON public.bazar_products
FOR SELECT USING (true);

CREATE POLICY "Admins can insert bazar products" ON public.bazar_products
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can update bazar products" ON public.bazar_products
FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can delete bazar products" ON public.bazar_products
FOR DELETE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

-- Suppliers RLS Policies
CREATE POLICY "Anyone can view suppliers" ON public.suppliers
FOR SELECT USING (true);

CREATE POLICY "Admins can insert suppliers" ON public.suppliers
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can update suppliers" ON public.suppliers
FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can delete suppliers" ON public.suppliers
FOR DELETE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

-- Triggers for updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bazar_products_updated_at
BEFORE UPDATE ON public.bazar_products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
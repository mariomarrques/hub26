import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProductWithCategory extends Product {
  category?: {
    name: string;
    slug: string;
  } | null;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  origin_price: string;
  resale_range: string;
  status: string;
  category_id: string | null;
  admin_note: string | null;
  affiliate_link: string | null;
  description: string | null;
  tags: string[] | null;
  real_photos: string[] | null;
  created_at: string | null;
  updated_at: string | null;
}

export type CreateProductInput = {
  name: string;
  image: string;
  origin_price: string;
  resale_range: string;
  status: string;
  category_id: string | null;
  admin_note?: string | null;
  affiliate_link?: string | null;
  real_photos?: string[] | null;
};
export type UpdateProductInput = Partial<CreateProductInput> & { id: string };

export function useProducts(categoryId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["products", categoryId],
    queryFn: async () => {
      let q = supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (categoryId) {
        q = q.eq("category_id", categoryId);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data as Product[];
    },
  });

  const createProduct = useMutation({
    mutationFn: async (product: CreateProductInput) => {
      const { data, error } = await supabase
        .from("products")
        .insert(product)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Produto criado com sucesso!");
    },
    onError: (error) => {
      console.error("Error creating product:", error);
      toast.error("Erro ao criar produto");
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...product }: UpdateProductInput) => {
      const { data, error } = await supabase
        .from("products")
        .update(product)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Produto atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Error updating product:", error);
      toast.error("Erro ao atualizar produto");
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Produto excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Error deleting product:", error);
      toast.error("Erro ao excluir produto");
    },
  });

  return {
    ...query,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(name, slug)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as ProductWithCategory | null;
    },
    enabled: !!id,
  });
}

export function useSearchProducts(query: string) {
  return useQuery({
    queryKey: ["products", "search", query],
    queryFn: async () => {
      if (!query.trim()) return [];

      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(name, slug)")
        .ilike("name", `%${query}%`)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as ProductWithCategory[];
    },
    enabled: query.length >= 2,
  });
}

export function useRelatedProducts(categoryId: string | null, excludeProductId: string) {
  return useQuery({
    queryKey: ["products", "related", categoryId, excludeProductId],
    queryFn: async () => {
      if (!categoryId) return [];

      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(name, slug)")
        .eq("category_id", categoryId)
        .neq("id", excludeProductId)
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) throw error;
      return data as ProductWithCategory[];
    },
    enabled: !!categoryId,
  });
}

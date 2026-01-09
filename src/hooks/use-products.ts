import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductWithCategory extends Product {
  categories?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface ProductInput {
  name: string;
  image: string;
  origin_price: string;
  resale_range: string;
  status?: string;
  category_id?: string;
  admin_note?: string;
  affiliate_link?: string;
}

export function useProducts(categorySlug?: string) {
  return useQuery({
    queryKey: ["products", categorySlug],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*, categories(id, name, slug)")
        .order("created_at", { ascending: false });

      if (categorySlug) {
        const { data: category } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", categorySlug)
          .maybeSingle();
        
        if (category) {
          query = query.eq("category_id", category.id);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ProductWithCategory[];
    },
  });
}

export function useAllProducts() {
  return useQuery({
    queryKey: ["products", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(id, name, slug)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProductWithCategory[];
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: ProductInput) => {
      const { error } = await supabase.from("products").insert(product);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto criado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar produto: " + error.message);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...product }: ProductInput & { id: string }) => {
      const { error } = await supabase
        .from("products")
        .update(product)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar produto: " + error.message);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto excluído com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao excluir produto: " + error.message);
    },
  });
}

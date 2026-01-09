import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BazarProduct {
  id: string;
  name: string;
  image: string;
  price: string;
  original_price: string | null;
  stock: number;
  max_stock: number;
  is_kit: boolean;
  kit_items: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BazarProductInput {
  name: string;
  image: string;
  price: string;
  original_price?: string;
  stock: number;
  max_stock?: number;
  is_kit?: boolean;
  kit_items?: number;
}

export function useBazarProducts() {
  return useQuery({
    queryKey: ["bazar-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bazar_products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BazarProduct[];
    },
  });
}

export function useCreateBazarProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: BazarProductInput) => {
      const { error } = await supabase.from("bazar_products").insert(product);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bazar-products"] });
      toast.success("Produto do bazar criado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar produto: " + error.message);
    },
  });
}

export function useUpdateBazarProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...product }: BazarProductInput & { id: string }) => {
      const { error } = await supabase
        .from("bazar_products")
        .update(product)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bazar-products"] });
      toast.success("Produto do bazar atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar produto: " + error.message);
    },
  });
}

export function useDeleteBazarProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("bazar_products")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bazar-products"] });
      toast.success("Produto do bazar excluído com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao excluir produto: " + error.message);
    },
  });
}

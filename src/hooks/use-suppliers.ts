import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Supplier {
  id: string;
  name: string;
  status: string;
  rating_quality: number;
  rating_delivery: number;
  rating_communication: number;
  categories: string[];
  admin_note: string | null;
  contact: string | null;
  link: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupplierInput {
  name: string;
  status?: string;
  rating_quality?: number;
  rating_delivery?: number;
  rating_communication?: number;
  categories?: string[];
  admin_note?: string;
  contact?: string;
  link?: string;
}

export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Supplier[];
    },
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (supplier: SupplierInput) => {
      const { error } = await supabase.from("suppliers").insert(supplier);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Fornecedor criado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar fornecedor: " + error.message);
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...supplier }: SupplierInput & { id: string }) => {
      const { error } = await supabase
        .from("suppliers")
        .update(supplier)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Fornecedor atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar fornecedor: " + error.message);
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("suppliers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Fornecedor excluído com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao excluir fornecedor: " + error.message);
    },
  });
}

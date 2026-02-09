import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NavLink {
  id: string;
  key: string;
  label: string;
  url: string | null;
  is_external: boolean;
  position: string;
  sort_order: number;
  updated_at: string;
}

export function useNavLinks() {
  const queryClient = useQueryClient();

  const { data: navLinks = [], isLoading } = useQuery({
    queryKey: ["nav-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nav_links")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as NavLink[];
    },
  });

  const updateLink = useMutation({
    mutationFn: async ({ id, url, label }: { id: string; url?: string; label?: string }) => {
      const updates: Record<string, unknown> = {};
      if (url !== undefined) updates.url = url;
      if (label !== undefined) updates.label = label;
      const { error } = await supabase.from("nav_links").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nav-links"] }),
  });

  const createLink = useMutation({
    mutationFn: async (link: { key: string; label: string; url?: string; is_external: boolean; position: string; sort_order: number }) => {
      const { error } = await supabase.from("nav_links").insert(link);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nav-links"] }),
  });

  const deleteLink = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("nav_links").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nav-links"] }),
  });

  const getLinksByPosition = (position: string) =>
    navLinks.filter((l) => l.position === position);

  return {
    navLinks,
    isLoading,
    updateLink,
    createLink,
    deleteLink,
    getLinksByPosition,
  };
}

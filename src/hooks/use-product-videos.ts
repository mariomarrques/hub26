import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProductVideo {
  id: string;
  product_id: string;
  title: string;
  panda_video_id: string | null;
  embed_url: string | null;
  thumbnail_url: string | null;
  downloadable_url: string | null;
  is_downloadable: boolean;
  sort_order: number;
  created_at: string;
  created_by: string | null;
}

export interface ProductVideoWithProduct extends ProductVideo {
  product?: {
    id: string;
    name: string;
    image: string;
  } | null;
}

export function useProductVideos(productId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["product-videos", productId],
    queryFn: async () => {
      let q = supabase
        .from("product_videos")
        .select("*")
        .order("sort_order", { ascending: true });

      if (productId) {
        q = q.eq("product_id", productId);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data as ProductVideo[];
    },
  });

  const createVideo = useMutation({
    mutationFn: async (video: Omit<ProductVideo, "id" | "created_at" | "created_by">) => {
      const { error } = await supabase.from("product_videos").insert(video);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-videos"] });
      queryClient.invalidateQueries({ queryKey: ["all-product-videos"] });
      toast.success("Vídeo adicionado com sucesso!");
    },
    onError: () => toast.error("Erro ao adicionar vídeo"),
  });

  const deleteVideo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("product_videos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-videos"] });
      queryClient.invalidateQueries({ queryKey: ["all-product-videos"] });
      toast.success("Vídeo removido!");
    },
    onError: () => toast.error("Erro ao remover vídeo"),
  });

  return { ...query, videos: query.data ?? [], createVideo, deleteVideo };
}

// All videos with product info for the Videos page
export function useAllProductVideos() {
  return useQuery({
    queryKey: ["all-product-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_videos")
        .select("*, product:products(id, name, image)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProductVideoWithProduct[];
    },
  });
}

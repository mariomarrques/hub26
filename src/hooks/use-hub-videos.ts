import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface HubVideo {
  id: string;
  title: string;
  original_filename: string | null;
  panda_video_id: string | null;
  embed_url: string | null;
  thumbnail_url: string | null;
  downloadable_url: string | null;
  is_downloadable: boolean;
  description: string | null;
  file_size_mb: number | null;
  upload_status: string;
  sort_order: number;
  created_at: string;
  created_by: string | null;
}

export function useHubVideos() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["hub-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hub_videos")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as HubVideo[];
    },
  });

  const createVideo = useMutation({
    mutationFn: async (video: Omit<HubVideo, "id" | "created_at" | "created_by">) => {
      const { error } = await supabase.from("hub_videos").insert(video);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hub-videos"] });
      toast.success("Vídeo adicionado com sucesso!");
    },
    onError: () => toast.error("Erro ao adicionar vídeo"),
  });

  const updateVideo = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HubVideo> & { id: string }) => {
      const { error } = await supabase.from("hub_videos").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hub-videos"] });
      toast.success("Vídeo atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar vídeo"),
  });

  const deleteVideo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hub_videos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hub-videos"] });
      toast.success("Vídeo removido!");
    },
    onError: () => toast.error("Erro ao remover vídeo"),
  });

  return { ...query, videos: query.data ?? [], createVideo, updateVideo, deleteVideo };
}

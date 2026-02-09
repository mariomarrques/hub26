import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Video {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  category: string | null;
  tags: string[] | null;
  created_at: string;
  created_by: string | null;
}

export function useVideos() {
  const queryClient = useQueryClient();

  const { data: videos = [], isLoading, error } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Video[];
    },
  });

  const createVideo = useMutation({
    mutationFn: async (video: Omit<Video, "id" | "created_at" | "created_by">) => {
      const { error } = await supabase.from("videos").insert(video);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["videos"] }),
  });

  const deleteVideo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("videos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["videos"] }),
  });

  return { videos, isLoading, error, createVideo, deleteVideo };
}

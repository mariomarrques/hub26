import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PostComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  author?: {
    name: string;
    avatar_url: string | null;
  };
  replies?: PostComment[];
}

export function usePostComments(postId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ["post-comments", postId],
    queryFn: async () => {
      if (!postId) return [];

      const { data, error } = await supabase
        .from("post_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch author profiles
      const authorIds = [...new Set(data?.map((c) => c.author_id) || [])];
      if (authorIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .in("id", authorIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]));

      const commentsWithAuthors = (data || []).map((comment) => ({
        ...comment,
        author: profileMap.get(comment.author_id) || { name: "Usuário", avatar_url: null },
      })) as PostComment[];

      // Organizar em árvore (comentários raiz + replies)
      const rootComments = commentsWithAuthors.filter(c => !c.parent_id);
      const replies = commentsWithAuthors.filter(c => c.parent_id);

      // Aninhar replies nos comentários pai
      const buildTree = (comments: PostComment[]): PostComment[] => {
        return comments.map(comment => ({
          ...comment,
          replies: replies
            .filter(r => r.parent_id === comment.id)
            .map(reply => ({
              ...reply,
              replies: replies.filter(r2 => r2.parent_id === reply.id)
            }))
        }));
      };

      return buildTree(rootComments);
    },
    enabled: !!postId,
  });

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id || !postId) throw new Error("Não autenticado");

      const { data, error } = await supabase
        .from("post_comments")
        .insert({
          post_id: postId,
          author_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      toast.success("Comentário adicionado!");
    },
    onError: (error) => {
      toast.error("Erro ao adicionar comentário: " + error.message);
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("post_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      toast.success("Comentário excluído!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir comentário: " + error.message);
    },
  });

  const addReply = useMutation({
    mutationFn: async ({ parentId, content }: { parentId: string; content: string }) => {
      if (!user?.id || !postId) throw new Error("Não autenticado");

      const { data, error } = await supabase
        .from("post_comments")
        .insert({
          post_id: postId,
          author_id: user.id,
          content,
          parent_id: parentId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      toast.success("Resposta adicionada!");
    },
    onError: (error) => {
      toast.error("Erro ao adicionar resposta: " + error.message);
    },
  });

  return {
    comments: comments || [],
    isLoading,
    addComment,
    deleteComment,
    addReply,
  };
}

export function usePostLikes(postId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["post-likes", postId],
    queryFn: async () => {
      if (!postId) return { count: 0, hasLiked: false };

      const { count, error } = await supabase
        .from("post_likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);

      if (error) throw error;

      let hasLiked = false;
      if (user?.id) {
        const { data: userLike } = await supabase
          .from("post_likes")
          .select("id")
          .eq("post_id", postId)
          .eq("user_id", user.id)
          .maybeSingle();

        hasLiked = !!userLike;
      }

      return { count: count || 0, hasLiked };
    },
    enabled: !!postId,
  });

  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!user?.id || !postId) throw new Error("Não autenticado");

      const { data: existingLike } = await supabase
        .from("post_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingLike) {
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("id", existingLike.id);
        if (error) throw error;
        return { action: "removed" };
      } else {
        const { error } = await supabase
          .from("post_likes")
          .insert({
            post_id: postId,
            user_id: user.id,
          });
        if (error) throw error;
        return { action: "added" };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-likes", postId] });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    },
  });

  return {
    likesCount: data?.count || 0,
    hasLiked: data?.hasLiked || false,
    isLoading,
    toggleLike,
  };
}

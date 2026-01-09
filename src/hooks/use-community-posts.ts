import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  category: string;
  author_id: string;
  status: "pending" | "approved" | "rejected";
  is_pinned: boolean;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  approved_by: string | null;
  likes_count?: number;
  comments_count?: number;
  author?: {
    name: string;
    avatar_url: string | null;
  };
}

export function useCommunityPosts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch approved posts
  const { data: approvedPosts, isLoading: loadingApproved } = useQuery({
    queryKey: ["community-posts", "approved"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .eq("status", "approved")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch author profiles separately
      const authorIds = [...new Set(data?.map((p) => p.author_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .in("id", authorIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]));

      // Fetch likes and comments counts
      const postIds = data?.map((p) => p.id) || [];
      
      const { data: likesData } = await supabase
        .from("post_likes")
        .select("post_id")
        .in("post_id", postIds);

      const { data: commentsData } = await supabase
        .from("post_comments")
        .select("post_id")
        .in("post_id", postIds);

      const likesMap = new Map<string, number>();
      const commentsMap = new Map<string, number>();

      likesData?.forEach((like) => {
        likesMap.set(like.post_id, (likesMap.get(like.post_id) || 0) + 1);
      });

      commentsData?.forEach((comment) => {
        commentsMap.set(comment.post_id, (commentsMap.get(comment.post_id) || 0) + 1);
      });

      return (data || []).map((post) => ({
        ...post,
        status: post.status as "pending" | "approved" | "rejected",
        author: profileMap.get(post.author_id) || { name: "Usuário", avatar_url: null },
        likes_count: likesMap.get(post.id) || 0,
        comments_count: commentsMap.get(post.id) || 0,
      })) as CommunityPost[];
    },
  });

  // Fetch user's own posts (all statuses)
  const { data: myPosts, isLoading: loadingMyPosts } = useQuery({
    queryKey: ["community-posts", "my-posts", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((post) => ({
        ...post,
        status: post.status as "pending" | "approved" | "rejected",
      })) as CommunityPost[];
    },
    enabled: !!user?.id,
  });

  // Create new post
  const createPost = useMutation({
    mutationFn: async (post: { 
      title: string; 
      content: string; 
      category: string;
      autoApprove?: boolean;
    }) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      // Se for admin/moderador, auto-aprovar
      if (post.autoApprove) {
        const { data, error } = await supabase
          .from("community_posts")
          .insert({
            title: post.title,
            content: post.content,
            category: post.category,
            author_id: user.id,
            status: "approved",
            approved_at: new Date().toISOString(),
            approved_by: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        return { data, wasAutoApproved: true };
      }

      const { data, error } = await supabase
        .from("community_posts")
        .insert({
          title: post.title,
          content: post.content,
          category: post.category,
          author_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, wasAutoApproved: false };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      if (result.wasAutoApproved) {
        toast.success("Tópico publicado com sucesso!");
      } else {
        toast.success("Tópico enviado para aprovação!");
      }
    },
    onError: (error) => {
      toast.error("Erro ao criar tópico: " + error.message);
    },
  });

  // Delete post
  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from("community_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      toast.success("Tópico excluído!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir tópico: " + error.message);
    },
  });

  return {
    approvedPosts: approvedPosts || [],
    myPosts: myPosts || [],
    loadingApproved,
    loadingMyPosts,
    createPost,
    deletePost,
  };
}

export function useAdminPosts() {
  const queryClient = useQueryClient();

  // Fetch pending posts (admin only)
  const { data: pendingPosts, isLoading } = useQuery({
    queryKey: ["community-posts", "pending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch author profiles
      const authorIds = [...new Set(data?.map((p) => p.author_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .in("id", authorIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]));

      return (data || []).map((post) => ({
        ...post,
        status: post.status as "pending" | "approved" | "rejected",
        author: profileMap.get(post.author_id) || { name: "Usuário", avatar_url: null },
      })) as CommunityPost[];
    },
  });

  // Approve post
  const approvePost = useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("community_posts")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
        })
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      toast.success("Post aprovado!");
    },
    onError: (error) => {
      toast.error("Erro ao aprovar post: " + error.message);
    },
  });

  // Reject post
  const rejectPost = useMutation({
    mutationFn: async ({ postId, reason }: { postId: string; reason?: string }) => {
      const { error } = await supabase
        .from("community_posts")
        .update({
          status: "rejected",
          rejection_reason: reason || null,
        })
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      toast.success("Post rejeitado!");
    },
    onError: (error) => {
      toast.error("Erro ao rejeitar post: " + error.message);
    },
  });

  // Toggle pin post
  const togglePinPost = useMutation({
    mutationFn: async (postId: string) => {
      // Buscar estado atual
      const { data: post, error: fetchError } = await supabase
        .from("community_posts")
        .select("is_pinned")
        .eq("id", postId)
        .single();

      if (fetchError) throw fetchError;

      // Inverter estado
      const { error } = await supabase
        .from("community_posts")
        .update({ is_pinned: !post?.is_pinned })
        .eq("id", postId);

      if (error) throw error;
      return { isPinned: !post?.is_pinned };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      toast.success(result.isPinned ? "Post fixado!" : "Post desfixado!");
    },
    onError: (error) => {
      toast.error("Erro ao fixar/desfixar post: " + error.message);
    },
  });

  return {
    pendingPosts: pendingPosts || [],
    isLoading,
    approvePost,
    rejectPost,
    togglePinPost,
  };
}

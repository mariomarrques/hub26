import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppRole } from "@/types/auth";
import { toast } from "sonner";

export interface UserWithRole {
  id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  role: AppRole;
  email: string;
}

export interface AdminStats {
  total_users: number;
  admin_count: number;
  moderator_count: number;
  member_count: number;
}

export interface BulkNotificationParams {
  type: "announcement" | "alert" | "product" | "community";
  title: string;
  message: string;
  link?: string;
  targetRoles?: AppRole[];
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async (): Promise<UserWithRole[]> => {
      const { data, error } = await supabase.rpc("get_all_users_with_roles");

      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }

      return (data || []) as UserWithRole[];
    },
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async (): Promise<AdminStats> => {
      const { data, error } = await supabase.rpc("get_user_stats");

      if (error) {
        console.error("Error fetching stats:", error);
        throw error;
      }

      const stats = data?.[0];
      return {
        total_users: Number(stats?.total_users) || 0,
        admin_count: Number(stats?.admin_count) || 0,
        moderator_count: Number(stats?.moderator_count) || 0,
        member_count: Number(stats?.member_count) || 0,
      };
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      newRole,
    }: {
      userId: string;
      newRole: AppRole;
    }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Role atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Error updating role:", error);
      toast.error("Erro ao atualizar role");
    },
  });
}

export function useSendBulkNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: BulkNotificationParams): Promise<number> => {
      const { data, error } = await supabase.rpc("send_bulk_notification", {
        p_type: params.type,
        p_title: params.title,
        p_message: params.message,
        p_link: params.link || null,
        p_target_roles: params.targetRoles || null,
      });

      if (error) throw error;
      return data as number;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      toast.success(`Notificação enviada para ${count} usuário(s)!`);
    },
    onError: (error) => {
      console.error("Error sending notification:", error);
      toast.error("Erro ao enviar notificação");
    },
  });
}

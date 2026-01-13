import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Notification, NotificationType } from "@/types/notification";
import { toast } from "sonner";

export function useNotificationsQuery(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar notificações:", error);
        throw error;
      }

      return (data || []).map((n) => ({
        ...n,
        type: n.type as NotificationType,
      })) as Notification[];
    },
    enabled: !!userId,
  });

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newNotification = {
              ...payload.new,
              type: payload.new.type as NotificationType,
            } as Notification;

            queryClient.setQueryData<Notification[]>(
              ["notifications", userId],
              (old = []) => [newNotification, ...old]
            );

            toast.info(newNotification.title, {
              description: newNotification.message,
            });
          } else if (payload.eventType === "UPDATE") {
            queryClient.setQueryData<Notification[]>(
              ["notifications", userId],
              (old = []) =>
                old.map((n) =>
                  n.id === payload.new.id
                    ? { ...payload.new, type: payload.new.type as NotificationType } as Notification
                    : n
                )
            );
          } else if (payload.eventType === "DELETE") {
            queryClient.setQueryData<Notification[]>(
              ["notifications", userId],
              (old = []) => old.filter((n) => n.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = async (id: string) => {
    // Atualização otimista
    queryClient.setQueryData<Notification[]>(
      ["notifications", userId],
      (old = []) => old.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      console.error("Erro ao marcar como lida:", error);
      toast.error("Erro ao marcar notificação como lida");
      // Reverter em caso de erro
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    // Atualização otimista
    queryClient.setQueryData<Notification[]>(
      ["notifications", userId],
      (old = []) => old.map((n) => ({ ...n, is_read: true }))
    );

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Erro ao marcar todas como lidas:", error);
      toast.error("Erro ao marcar notificações como lidas");
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    } else {
      toast.success("Todas as notificações foram marcadas como lidas");
    }
  };

  const deleteNotification = async (id: string) => {
    // Atualização otimista - remove imediatamente da UI
    queryClient.setQueryData<Notification[]>(
      ["notifications", userId],
      (old = []) => old.filter((n) => n.id !== id)
    );

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao deletar notificação:", error);
      toast.error("Erro ao deletar notificação");
      // Reverter em caso de erro
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    } else {
      toast.success("Notificação removida");
    }
  };

  const deleteAllNotifications = async () => {
    if (!userId) return;

    const count = notifications.length;
    
    // Atualização otimista
    queryClient.setQueryData<Notification[]>(["notifications", userId], []);

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Erro ao deletar notificações:", error);
      toast.error("Erro ao limpar notificações");
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    } else {
      toast.success(`${count} notificação${count > 1 ? "ões" : ""} removida${count > 1 ? "s" : ""}`);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  };
}

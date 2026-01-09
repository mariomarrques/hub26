import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface NotificationSettings {
  id: string;
  user_id: string;
  new_products: boolean;
  bazar_alerts: boolean;
  community_messages: boolean;
  created_at: string;
  updated_at: string;
}

type SettingsUpdate = Partial<Pick<NotificationSettings, 'new_products' | 'bazar_alerts' | 'community_messages'>>;

export function useNotificationSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["notification-settings", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("user_notification_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar preferências:", error);
        throw error;
      }

      // Retorna os dados ou valores padrão
      return data || {
        id: "",
        user_id: user.id,
        new_products: true,
        bazar_alerts: false,
        community_messages: true,
        created_at: "",
        updated_at: "",
      };
    },
    enabled: !!user?.id,
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: SettingsUpdate) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("user_notification_settings")
        .upsert(
          {
            user_id: user.id,
            ...updates,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-settings", user?.id] });
      toast.success("Preferências atualizadas");
    },
    onError: (error) => {
      console.error("Erro ao atualizar preferências:", error);
      toast.error("Erro ao salvar preferências");
    },
  });

  return {
    settings,
    isLoading,
    updateSettings,
  };
}

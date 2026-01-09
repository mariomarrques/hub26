import { SettingsSection } from "./SettingsSection";
import { SettingsItem } from "./SettingsItem";
import { Switch } from "@/components/ui/switch";
import { useNotificationSettings } from "@/hooks/use-notification-settings";
import { Skeleton } from "@/components/ui/skeleton";

export function NotificationsSettings() {
  const { settings, isLoading, updateSettings } = useNotificationSettings();

  const handleToggle = (key: 'new_products' | 'bazar_alerts' | 'community_messages', value: boolean) => {
    updateSettings.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <SettingsSection title="Notificações">
        <div className="space-y-4 p-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection title="Notificações">
      <SettingsItem
        label="Novos produtos"
        description="Seja notificado quando novos produtos forem cadastrados"
      >
        <Switch
          checked={settings?.new_products ?? true}
          onCheckedChange={(value) => handleToggle("new_products", value)}
          disabled={updateSettings.isPending}
        />
      </SettingsItem>

      <SettingsItem
        label="Alertas do bazar"
        description="Em breve - Avisos sobre ofertas e promoções"
      >
        <Switch
          checked={false}
          disabled
          className="opacity-50"
        />
      </SettingsItem>

      <SettingsItem
        label="Mensagens da comunidade"
        description="Notificações de respostas e menções nos seus tópicos"
        showSeparator={false}
      >
        <Switch
          checked={settings?.community_messages ?? true}
          onCheckedChange={(value) => handleToggle("community_messages", value)}
          disabled={updateSettings.isPending}
        />
      </SettingsItem>
    </SettingsSection>
  );
}

import { useState } from "react";
import { SettingsSection } from "./SettingsSection";
import { SettingsItem } from "./SettingsItem";
import { Switch } from "@/components/ui/switch";

export function NotificationsSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newProducts, setNewProducts] = useState(true);
  const [bazaarAlerts, setBazaarAlerts] = useState(false);
  const [communityMessages, setCommunityMessages] = useState(true);

  return (
    <SettingsSection title="Notificações">
      <SettingsItem
        label="Notificações por email"
        description="Receba alertas importantes por email"
      >
        <Switch
          checked={emailNotifications}
          onCheckedChange={setEmailNotifications}
        />
      </SettingsItem>

      <SettingsItem
        label="Novos produtos"
        description="Seja notificado sobre novos produtos"
      >
        <Switch
          checked={newProducts}
          onCheckedChange={setNewProducts}
        />
      </SettingsItem>

      <SettingsItem
        label="Alertas do bazar"
        description="Avisos sobre ofertas e promoções"
      >
        <Switch
          checked={bazaarAlerts}
          onCheckedChange={setBazaarAlerts}
        />
      </SettingsItem>

      <SettingsItem
        label="Mensagens da comunidade"
        description="Notificações de respostas e menções"
        showSeparator={false}
      >
        <Switch
          checked={communityMessages}
          onCheckedChange={setCommunityMessages}
        />
      </SettingsItem>
    </SettingsSection>
  );
}

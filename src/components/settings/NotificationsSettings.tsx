import { useState } from "react";
import { SettingsSection } from "./SettingsSection";
import { SettingsItem } from "./SettingsItem";
import { Switch } from "@/components/ui/switch";

export function NotificationsSettings() {
  const [newProducts, setNewProducts] = useState(true);
  const [bazaarAlerts, setBazaarAlerts] = useState(false);
  const [communityMessages, setCommunityMessages] = useState(true);

  return (
    <SettingsSection title="Notificações">
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

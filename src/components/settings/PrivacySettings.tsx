import { useState } from "react";
import { SettingsSection } from "./SettingsSection";
import { SettingsItem } from "./SettingsItem";
import { Switch } from "@/components/ui/switch";

export function PrivacySettings() {
  const [publicProfile, setPublicProfile] = useState(true);
  const [showStats, setShowStats] = useState(true);

  return (
    <SettingsSection title="Privacidade">
      <SettingsItem
        label="Perfil público"
        description="Permitir que outros vejam seu perfil"
      >
        <Switch
          checked={publicProfile}
          onCheckedChange={setPublicProfile}
        />
      </SettingsItem>

      <SettingsItem
        label="Mostrar estatísticas"
        description="Exibir suas estatísticas no perfil"
        showSeparator={false}
      >
        <Switch
          checked={showStats}
          onCheckedChange={setShowStats}
        />
      </SettingsItem>
    </SettingsSection>
  );
}

import { PreferencesSettings } from "@/components/settings/PreferencesSettings";
import { NotificationsSettings } from "@/components/settings/NotificationsSettings";
import { PrivacySettings } from "@/components/settings/PrivacySettings";

export default function Configuracoes() {
  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="text-xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-xs">
          Personalize sua experiência no Hub 26
        </p>
      </div>

      <PreferencesSettings />
      <NotificationsSettings />
      <PrivacySettings />
    </div>
  );
}

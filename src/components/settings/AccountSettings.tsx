import { useState } from "react";
import { KeyRound, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SettingsSection } from "./SettingsSection";
import { SettingsItem } from "./SettingsItem";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { Button } from "@/components/ui/button";

export function AccountSettings() {
  const { user } = useAuth();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  return (
    <SettingsSection title="Conta">
      <SettingsItem
        label="Email"
        description={user?.email || "Não definido"}
      >
        <Mail className="h-5 w-5 text-muted-foreground" />
      </SettingsItem>

      <SettingsItem
        label="Senha"
        description="Altere sua senha de acesso"
        showSeparator={false}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPasswordDialog(true)}
        >
          <KeyRound className="h-4 w-4 mr-2" />
          Alterar
        </Button>
      </SettingsItem>

      <ChangePasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
      />
    </SettingsSection>
  );
}

import { useState } from "react";
import { SettingsSection } from "./SettingsSection";
import { SettingsItem } from "./SettingsItem";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PreferencesSettings() {
  const [theme, setTheme] = useState("dark");
  const [language, setLanguage] = useState("pt");

  return (
    <SettingsSection title="Preferências">
      <SettingsItem
        label="Tema"
        description="Escolha entre claro e escuro"
      >
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger className="w-[140px] bg-background border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="dark">Escuro</SelectItem>
            <SelectItem value="light">Claro</SelectItem>
          </SelectContent>
        </Select>
      </SettingsItem>

      <SettingsItem
        label="Idioma"
        description="Selecione seu idioma preferido"
        showSeparator={false}
      >
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[140px] bg-background border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="pt">Português</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Español</SelectItem>
          </SelectContent>
        </Select>
      </SettingsItem>
    </SettingsSection>
  );
}

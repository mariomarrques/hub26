import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { SettingsSection } from "./SettingsSection";
import { SettingsItem } from "./SettingsItem";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export function PreferencesSettings() {
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState("pt");
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <SettingsSection title="Preferências">
      <SettingsItem
        label="Tema"
        description="Escolha entre claro, escuro ou seguir o dispositivo"
      >
        {!mounted ? (
          <Skeleton className="h-10 w-[160px]" />
        ) : (
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="w-[160px] bg-background border-border">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="dark">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  Escuro
                </div>
              </SelectItem>
              <SelectItem value="light">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Claro
                </div>
              </SelectItem>
              <SelectItem value="system">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Sistema
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </SettingsItem>

      <SettingsItem
        label="Idioma"
        description="Selecione seu idioma preferido"
        showSeparator={false}
      >
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[160px] bg-background border-border">
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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-md">
        <CardTitle className="text-base font-semibold text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-0">
        {children}
      </CardContent>
    </Card>
  );
}

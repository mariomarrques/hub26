import { Separator } from "@/components/ui/separator";

interface SettingsItemProps {
  label: string;
  description: string;
  children: React.ReactNode;
  showSeparator?: boolean;
}

export function SettingsItem({ label, description, children, showSeparator = true }: SettingsItemProps) {
  return (
    <>
      <div className="flex items-center justify-between py-md">
        <div className="flex flex-col gap-xs">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="text-xs text-muted-foreground">{description}</span>
        </div>
        <div className="flex-shrink-0">
          {children}
        </div>
      </div>
      {showSeparator && <Separator className="bg-border" />}
    </>
  );
}

import { Mail } from "lucide-react";

interface ProfileInfoProps {
  email?: string | null;
}

export function ProfileInfo({ email }: ProfileInfoProps) {
  if (!email) return null;

  return (
    <div className="bg-card rounded-xl p-lg border border-border">
      <h2 className="text-base font-semibold text-foreground mb-md">
        Informações da Conta
      </h2>
      <div className="flex items-center gap-sm">
        <Mail className="h-4 w-4 text-muted-foreground" />
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Email</span>
          <span className="text-sm text-foreground">{email}</span>
        </div>
      </div>
    </div>
  );
}

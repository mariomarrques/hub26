import { Mail, Phone } from "lucide-react";
import { UserProfile } from "@/types/member";

interface ProfileInfoProps {
  user: UserProfile;
}

export function ProfileInfo({ user }: ProfileInfoProps) {
  const infoItems = [
    {
      icon: Mail,
      label: "Email",
      value: user.email,
    },
    {
      icon: Phone,
      label: "Telefone",
      value: user.phone,
    },
  ].filter((item) => item.value);

  if (infoItems.length === 0) return null;

  return (
    <div className="bg-card rounded-xl p-lg border border-border">
      <h2 className="text-base font-semibold text-foreground mb-md">
        Informações da Conta
      </h2>
      <div className="flex flex-col gap-md">
        {infoItems.map((item, index) => (
          <div key={index} className="flex items-center gap-sm">
            <item.icon className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">{item.label}</span>
              <span className="text-sm text-foreground">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProfileHeaderProps {
  name: string;
  avatarUrl?: string | null;
  createdAt?: string | null;
}

export function ProfileHeader({ name, avatarUrl, createdAt }: ProfileHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formattedDate = createdAt
    ? format(new Date(createdAt), "MMMM 'de' yyyy", { locale: ptBR })
    : null;

  return (
    <div className="bg-sidebar rounded-xl p-lg border border-border">
      <div className="flex items-center gap-md">
        <Avatar className="h-14 w-14">
          <AvatarImage src={avatarUrl || undefined} alt={name} />
          <AvatarFallback className="bg-primary/10 text-primary text-lg">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col gap-xs">
          <h1 className="text-xl font-semibold text-foreground">{name}</h1>
          {formattedDate && (
            <div className="flex items-center gap-xs text-muted-foreground text-sm">
              <Calendar className="h-3.5 w-3.5" />
              <span>Membro desde {formattedDate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

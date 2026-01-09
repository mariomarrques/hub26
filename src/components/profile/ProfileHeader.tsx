import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MemberBadge } from "@/components/member/MemberBadge";
import { Calendar } from "lucide-react";
import { UserProfile } from "@/types/member";

interface ProfileHeaderProps {
  user: UserProfile;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-sidebar rounded-xl p-lg border border-border">
      <div className="flex items-center gap-md">
        <Avatar className="h-14 w-14">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="bg-primary/10 text-primary text-lg">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col gap-xs">
          <h1 className="text-xl font-semibold text-foreground">{user.name}</h1>
          <div className="flex items-center gap-sm">
            <MemberBadge tier={user.tier} />
            {user.memberSince && (
              <div className="flex items-center gap-xs text-muted-foreground text-sm">
                <Calendar className="h-3.5 w-3.5" />
                <span>Membro desde {user.memberSince}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

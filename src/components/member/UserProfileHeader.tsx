import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MemberBadge } from "./MemberBadge";
import { UserProfile } from "@/types/member";
import { cn } from "@/lib/utils";

interface UserProfileHeaderProps {
  user: UserProfile;
  collapsed?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function UserProfileHeader({ user, collapsed = false }: UserProfileHeaderProps) {
  return (
    <div className="flex items-center gap-sm">
      <Avatar className="h-9 w-9 border border-sidebar-border">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      {!collapsed && (
        <div className="animate-fade-in min-w-0 flex-1">
          <h1 className="text-[14px] font-semibold text-foreground truncate">
            {user.name}
          </h1>
          <MemberBadge tier={user.tier} />
        </div>
      )}
    </div>
  );
}

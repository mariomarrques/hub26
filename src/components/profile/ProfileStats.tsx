import { ShoppingBag, Users, CalendarDays, Award } from "lucide-react";
import { UserProfile, MEMBER_LEVELS } from "@/types/member";

interface ProfileStatsProps {
  user: UserProfile;
}

export function ProfileStats({ user }: ProfileStatsProps) {
  const stats = user.stats;
  const levelName = MEMBER_LEVELS[user.tier].name;

  const statItems = [
    {
      icon: ShoppingBag,
      value: stats?.productsBought ?? 0,
      label: "Produtos Comprados",
    },
    {
      icon: Users,
      value: stats?.suppliersConnected ?? 0,
      label: "Fornecedores Conectados",
    },
    {
      icon: CalendarDays,
      value: stats?.daysInCommunity ?? 0,
      label: "Dias na Comunidade",
    },
    {
      icon: Award,
      value: levelName,
      label: "Nível Atual",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="bg-card rounded-xl p-md border border-border flex flex-col gap-xs"
        >
          <div className="flex items-center gap-sm text-muted-foreground">
            <item.icon className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold text-foreground">
            {item.value}
          </span>
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

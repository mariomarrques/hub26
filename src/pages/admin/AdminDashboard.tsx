import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Shield, UserCheck, User } from "lucide-react";
import { useAdminStats, useAdminUsers } from "@/hooks/use-admin";
import { formatRelativeTime } from "@/lib/date-utils";
import { AppRole } from "@/types/auth";

const roleColors: Record<AppRole, string> = {
  admin: "bg-red-500/10 text-red-500 border-red-500/20",
  moderator: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  member: "bg-green-500/10 text-green-500 border-green-500/20",
};

const roleLabels: Record<AppRole, string> = {
  admin: "Admin",
  moderator: "Mod",
  member: "Membro",
};

export default function AdminDashboard() {
  const { data: stats, isLoading: loadingStats } = useAdminStats();
  const { data: users, isLoading: loadingUsers } = useAdminUsers();

  const recentUsers = users?.slice(0, 5) || [];

  const statCards = [
    {
      title: "Total de Usuários",
      value: stats?.total_users || 0,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Administradores",
      value: stats?.admin_count || 0,
      icon: Shield,
      color: "text-red-500",
    },
    {
      title: "Moderadores",
      value: stats?.moderator_count || 0,
      icon: UserCheck,
      color: "text-blue-500",
    },
    {
      title: "Membros",
      value: stats?.member_count || 0,
      icon: User,
      color: "text-green-500",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{stat.value}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuários Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : recentUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum usuário encontrado
              </p>
            ) : (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 rounded-lg border p-3"
                  >
                    <Avatar>
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={roleColors[user.role]}
                      >
                        {roleLabels[user.role]}
                      </Badge>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatRelativeTime(user.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

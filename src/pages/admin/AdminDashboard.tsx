import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Shield, 
  UserCheck, 
  User, 
  Activity, 
  Zap, 
  Bell, 
  Package,
  BarChart3,
  ArrowRight,
  MessageSquare
} from "lucide-react";
import { useAdminStats, useAdminUsers } from "@/hooks/use-admin";
import { useAdminPosts } from "@/hooks/use-community-posts";
import { useProducts } from "@/hooks/use-products";
import { formatRelativeTime } from "@/lib/date-utils";
import { AppRole } from "@/types/auth";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const { data: stats, isLoading: loadingStats } = useAdminStats();
  const { data: users, isLoading: loadingUsers } = useAdminUsers();
  const { pendingPosts, isLoading: loadingPosts } = useAdminPosts();
  const { data: products, isLoading: loadingProducts } = useProducts();

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
        {/* Seção: Visão Geral */}
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            Visão Geral
          </h2>
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
        </div>

        {/* Grid de duas colunas */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Coluna 1: Usuários Recentes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5 text-primary" />
                Usuários Recentes
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => navigate('/admin/usuarios')}
              >
                Ver todos
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-3 w-36" />
                      </div>
                      <Skeleton className="h-5 w-14" />
                    </div>
                  ))}
                </div>
              ) : recentUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">
                  Nenhum usuário encontrado
                </p>
              ) : (
                <div className="space-y-3">
                  {recentUsers.slice(0, 4).map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 rounded-lg border p-2.5"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="text-sm">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {formatRelativeTime(user.created_at)}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${roleColors[user.role]}`}
                      >
                        {roleLabels[user.role]}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coluna 2: Resumo de Atividade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-5 w-5 text-primary" />
                Resumo de Atividade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Posts Pendentes - Com destaque se houver */}
                <div 
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    (pendingPosts?.length || 0) > 0 
                      ? "bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20" 
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                  onClick={() => navigate('/admin/posts')}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${
                      (pendingPosts?.length || 0) > 0 ? "bg-amber-500/20" : "bg-muted"
                    }`}>
                      <MessageSquare className={`h-4 w-4 ${
                        (pendingPosts?.length || 0) > 0 ? "text-amber-500" : "text-muted-foreground"
                      }`} />
                    </div>
                    <div>
                      <span className="text-sm font-medium">Posts pendentes</span>
                      {(pendingPosts?.length || 0) > 0 && (
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          Aguardando moderação
                        </p>
                      )}
                    </div>
                  </div>
                  {loadingPosts ? (
                    <Skeleton className="h-5 w-8" />
                  ) : (
                    <Badge 
                      variant={(pendingPosts?.length || 0) > 0 ? "default" : "secondary"}
                      className={(pendingPosts?.length || 0) > 0 ? "bg-amber-500 hover:bg-amber-600" : ""}
                    >
                      {pendingPosts?.length || 0}
                    </Badge>
                  )}
                </div>

                {/* Total de Produtos */}
                <div 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => navigate('/admin/produtos')}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">Produtos cadastrados</span>
                  </div>
                  {loadingProducts ? (
                    <Skeleton className="h-5 w-8" />
                  ) : (
                    <Badge variant="secondary">{products?.length || 0}</Badge>
                  )}
                </div>

                {/* Total de Usuários */}
                <div 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => navigate('/admin/usuarios')}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-green-500/10">
                      <Users className="h-4 w-4 text-green-500" />
                    </div>
                    <span className="text-sm">Total de usuários</span>
                  </div>
                  {loadingStats ? (
                    <Skeleton className="h-5 w-8" />
                  ) : (
                    <Badge variant="secondary">{stats?.total_users || 0}</Badge>
                  )}
                </div>

                {/* Equipe (Admins + Moderadores) */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-blue-500/10">
                      <Shield className="h-4 w-4 text-blue-500" />
                    </div>
                    <span className="text-sm">Equipe (Admins + Mods)</span>
                  </div>
                  {loadingStats ? (
                    <Skeleton className="h-5 w-8" />
                  ) : (
                    <Badge variant="secondary">
                      {(stats?.admin_count || 0) + (stats?.moderator_count || 0)}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-5 w-5 text-primary" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/usuarios')}
              >
                <Users className="h-4 w-4 mr-2" />
                Gerenciar Usuários
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/notificacoes')}
              >
                <Bell className="h-4 w-4 mr-2" />
                Enviar Notificação
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/produtos')}
              >
                <Package className="h-4 w-4 mr-2" />
                Gerenciar Produtos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

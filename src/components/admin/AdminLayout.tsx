import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Bell, History, MessageSquare, Package, Link2, Video } from "lucide-react";

const adminTabs = [
  { value: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { value: "/admin/usuarios", label: "Usuários", icon: Users },
  { value: "/admin/produtos", label: "Produtos", icon: Package },
  { value: "/admin/videos", label: "Vídeos", icon: Video },
  { value: "/admin/notificacoes", label: "Notificações", icon: Bell },
  { value: "/admin/posts", label: "Posts", icon: MessageSquare },
  { value: "/admin/logs", label: "Logs", icon: History },
  { value: "/admin/links", label: "Links", icon: Link2 },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Área de Administração</h1>
        <p className="text-muted-foreground">
          Gerencie usuários, produtos, notificações e monitore atividades
        </p>
      </div>

      <Tabs value={location.pathname} onValueChange={(value) => navigate(value)}>
        <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full overflow-x-auto">
          {adminTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-2 whitespace-nowrap px-3"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div>{children}</div>
    </div>
  );
}

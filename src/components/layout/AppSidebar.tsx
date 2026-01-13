import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Package,
  Store,
  Users,
  Bell,
  MessageSquare,
  Shield,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { useAdminPosts } from "@/hooks/use-community-posts";
import { ComingSoonDialog } from "@/components/ui/coming-soon-dialog";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  comingSoon?: boolean;
}

const navigation: NavItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Produtos", href: "/produtos", icon: Package },
  { name: "Bazar do Marin", href: "/bazar", icon: Store, comingSoon: true },
  { name: "Fornecedores", href: "/fornecedores", icon: Users },
  { name: "Comunidade", href: "/comunidade", icon: MessageSquare },
  { name: "Avisos", href: "/avisos", icon: Bell },
];

const adminNavigation = [
  { name: "Administração", href: "/admin", icon: Shield },
];

export function AppSidebar() {
  const { isOpen, close } = useSidebarContext();
  const location = useLocation();
  const { profile, role, isAdmin } = useAuth();
  const { pendingPosts } = useAdminPosts();
  const pendingCount = isAdmin ? (pendingPosts?.length || 0) : 0;

  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState("");

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = profile?.name || "Usuário";

  const getRoleBadge = () => {
    if (!role) return null;
    const roleConfig = {
      admin: { label: "Admin", className: "bg-destructive/20 text-destructive border-destructive/30" },
      moderator: { label: "Mod", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
      member: { label: "Membro", className: "bg-primary/20 text-primary border-primary/30" },
    };
    return roleConfig[role];
  };

  const roleBadge = getRoleBadge();

  const handleNavClick = () => {
    close();
  };

  const handleComingSoonClick = (item: NavItem) => {
    setComingSoonFeature(item.name);
    setShowComingSoon(true);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-14 z-50 flex h-[calc(100vh-56px)] w-sidebar flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* User Profile */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-md">
          <div className="flex items-center gap-sm overflow-hidden">
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium text-foreground">
                {displayName}
              </span>
              {roleBadge && (
                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 w-fit", roleBadge.className)}>
                  {roleBadge.label}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-sm py-md">
          {navigation.map((item, index) => {
            const isActive = location.pathname === item.href;
            
            if (item.comingSoon) {
              return (
                <div
                  key={item.name}
                  onClick={() => handleComingSoonClick(item)}
                  className={cn(
                    "group flex items-center gap-sm rounded-nav px-md py-sm h-nav-item text-[14px] font-medium cursor-pointer transition-all duration-hover ease-hover",
                    "text-text-secondary hover:bg-hover hover:text-foreground"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <item.icon
                    className="h-[18px] w-[18px] flex-shrink-0 text-text-muted group-hover:text-foreground transition-colors"
                    strokeWidth={1.5}
                  />
                  <span className="truncate">{item.name}</span>
                  {/* Badge "Em breve" */}
                  <span className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide bg-amber-500/15 text-amber-500 border border-amber-500/25">
                    <Sparkles className="h-2.5 w-2.5" />
                    Breve
                  </span>
                </div>
              );
            }
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={handleNavClick}
                className={cn(
                  "group flex items-center gap-sm rounded-nav px-md py-sm h-nav-item text-[14px] font-medium transition-all duration-hover ease-hover",
                  isActive
                    ? "bg-active text-foreground font-semibold"
                    : "text-text-secondary hover:bg-hover hover:text-foreground"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <item.icon
                  className={cn(
                    "h-[18px] w-[18px] flex-shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-text-muted group-hover:text-foreground"
                  )}
                  strokeWidth={1.5}
                />
                <span className="truncate">{item.name}</span>
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </NavLink>
            );
          })}

          {/* Admin Navigation */}
          {isAdmin && (
            <>
              <div className="my-2 border-t border-sidebar-border" />
              {adminNavigation.map((item, index) => {
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      "group flex items-center gap-sm rounded-nav px-md py-sm h-nav-item text-[14px] font-medium transition-all duration-hover ease-hover",
                      isActive
                        ? "bg-destructive/10 text-destructive font-semibold"
                        : "text-text-secondary hover:bg-hover hover:text-foreground"
                    )}
                    style={{ animationDelay: `${(navigation.length + index) * 50}ms` }}
                  >
                    <item.icon
                      className={cn(
                        "h-[18px] w-[18px] flex-shrink-0 transition-colors",
                        isActive ? "text-destructive" : "text-text-muted group-hover:text-foreground"
                      )}
                      strokeWidth={1.5}
                    />
                    <span className="truncate">{item.name}</span>
                    {pendingCount > 0 ? (
                      <Badge 
                        variant="destructive" 
                        className="ml-auto h-5 min-w-5 flex items-center justify-center text-[10px] px-1.5 animate-pulse"
                      >
                        {pendingCount > 99 ? "99+" : pendingCount}
                      </Badge>
                    ) : isActive ? (
                      <div className="ml-auto h-1.5 w-1.5 rounded-full bg-destructive" />
                    ) : null}
                  </NavLink>
                );
              })}
            </>
          )}
        </nav>
      </aside>

      <ComingSoonDialog 
        open={showComingSoon} 
        onOpenChange={setShowComingSoon}
        featureName={comingSoonFeature}
      />
    </>
  );
}

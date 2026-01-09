import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Package,
  Store,
  Users,
  Bell,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

const navigation = [
  { name: "Produtos", href: "/", icon: Package },
  { name: "Bazar do Marin", href: "/bazar", icon: Store },
  { name: "Fornecedores", href: "/fornecedores", icon: Users },
  { name: "Avisos", href: "/avisos", icon: Bell },
  { name: "Comunidade", href: "/comunidade", icon: MessageSquare },
];

const adminNavigation = [
  { name: "Administração", href: "/admin", icon: Shield },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { profile, role, isAdmin } = useAuth();

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

  return (
    <aside
      className={cn(
        "fixed left-0 top-14 z-40 flex h-[calc(100vh-56px)] flex-col border-r border-sidebar-border bg-sidebar transition-all duration-hover ease-hover",
        collapsed ? "w-16" : "w-sidebar"
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
          {!collapsed && (
            <div className="flex flex-col overflow-hidden animate-fade-in">
              <span className="truncate text-sm font-medium text-foreground">
                {displayName}
              </span>
              {roleBadge && (
                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 w-fit", roleBadge.className)}>
                  {roleBadge.label}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-sm py-md">
        {navigation.map((item, index) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
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
              {!collapsed && (
                <span className="animate-fade-in truncate">{item.name}</span>
              )}
              {isActive && !collapsed && (
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
                  {!collapsed && (
                    <span className="animate-fade-in truncate">{item.name}</span>
                  )}
                  {isActive && !collapsed && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-destructive" />
                  )}
                </NavLink>
              );
            })}
          </>
        )}
      </nav>

      {/* Collapse button */}
      <div className="border-t border-sidebar-border p-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-text-muted hover:text-foreground hover:bg-hover"
        >
          {collapsed ? (
            <ChevronRight className="h-[18px] w-[18px]" strokeWidth={1.5} />
          ) : (
            <>
              <ChevronLeft className="h-[18px] w-[18px] mr-2" strokeWidth={1.5} />
              <span className="text-small">Recolher</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}

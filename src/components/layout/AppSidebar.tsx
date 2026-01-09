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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserProfileHeader } from "@/components/member/UserProfileHeader";
import { currentUser } from "@/data/mockData";

const navigation = [
  { name: "Produtos", href: "/", icon: Package },
  { name: "Bazar do Marin", href: "/bazar", icon: Store },
  { name: "Fornecedores", href: "/fornecedores", icon: Users },
  { name: "Avisos", href: "/avisos", icon: Bell },
  { name: "Comunidade", href: "/comunidade", icon: MessageSquare },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-hover ease-hover",
        collapsed ? "w-16" : "w-sidebar"
      )}
    >
      {/* User Profile */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-md">
        <UserProfileHeader user={currentUser} collapsed={collapsed} />
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

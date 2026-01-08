import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Package,
  Store,
  Users,
  Bell,
  MessageSquare,
  Hexagon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Hexagon className="h-5 w-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-sm font-semibold text-foreground">Operação Hexa</h1>
              <p className="text-xs text-muted-foreground">ISA+ECG</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item, index) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ease-out",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                )}
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
      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-muted-foreground hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-xs">Recolher</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}

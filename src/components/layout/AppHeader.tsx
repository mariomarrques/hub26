import { Hexagon, ChevronDown, User, Settings, LogOut, Menu, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebarContext } from "@/contexts/SidebarContext";

export function AppHeader() {
  const { toggle } = useSidebarContext();
  const { profile, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = profile?.name || "Usuário";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-sidebar-border bg-sidebar">
      <div className="flex h-full items-center justify-between px-lg gap-md">
        {/* Hamburger + Logo */}
        <div className="flex items-center gap-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </Button>
          <Link 
            to="/" 
            className="flex items-center gap-sm hover:opacity-80 transition-opacity"
          >
            <Hexagon className="h-6 w-6 text-primary" strokeWidth={1.5} />
            <span className="text-lg font-bold text-foreground tracking-tight">
              Hub 26
            </span>
          </Link>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side: Theme Toggle + Notifications + User Menu */}
        <div className="flex items-center gap-sm">

          {/* Theme Toggle */}
          {mounted && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  {resolvedTheme === "dark" ? (
                    <Sun className="h-5 w-5 transition-transform duration-300 hover:rotate-45" strokeWidth={1.5} />
                  ) : (
                    <Moon className="h-5 w-5 transition-transform duration-300 hover:-rotate-12" strokeWidth={1.5} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{resolvedTheme === "dark" ? "Tema claro" : "Tema escuro"}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Notifications */}
          <NotificationDropdown />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-accent">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium text-foreground">{displayName}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/perfil">
                  <User className="mr-2 h-4 w-4" />
                  Meu Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/configuracoes">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={() => signOut()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

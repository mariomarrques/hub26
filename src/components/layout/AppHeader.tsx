import { Hexagon, ChevronDown, User, Settings, LogOut, Moon, Sun, ExternalLink, ShoppingBag, LayoutGrid, Video, Headphones, Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
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
import { useNavLinks } from "@/hooks/use-nav-links";
import { cn } from "@/lib/utils";
import { CSSBuyDropdown, CatalogoDropdown } from "./NavbarDropdowns";

interface NavItemConfig {
  name: string;
  path?: string;
  icon: React.ElementType;
  hasDropdown?: boolean;
  external?: boolean;
  getUrl?: () => string | null;
}

const NAV_ITEMS: NavItemConfig[] = [
  { name: "CSSBuy", icon: ShoppingBag, hasDropdown: true },
  { name: "Catálogo", icon: LayoutGrid, hasDropdown: true },
  { name: "Vídeos", icon: Video, path: "/videos" },
  { name: "Suporte", icon: Headphones, external: true },
];

export function AppHeader() {
  const { profile, isAdmin, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const location = useLocation();
  const { getLinksByPosition } = useNavLinks();

  useEffect(() => { setMounted(true); }, []);

  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const displayName = profile?.name || "Usuário";

  const suporteLink = getLinksByPosition("suporte")[0];

  const isActive = (item: NavItemConfig) => {
    if (item.path) return location.pathname === item.path;
    if (item.name === "CSSBuy") return location.pathname === "/produtos";
    return false;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex h-full items-center justify-between px-4 md:px-6 max-w-[1440px] mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
          <Hexagon className="h-7 w-7 text-primary" strokeWidth={1.5} />
          <span className="text-lg font-bold text-foreground tracking-tight hidden sm:block">Hub 26</span>
        </Link>

        {/* Center Nav - Tubelight style */}
        <nav className="flex items-center gap-0.5 bg-card/60 backdrop-blur-sm border border-border rounded-full px-1.5 py-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            const navContent = (
              <span
                className={cn(
                  "relative cursor-pointer text-[13px] font-semibold px-3 md:px-4 py-2 rounded-full transition-colors flex items-center gap-1.5",
                  "text-foreground/70 hover:text-primary",
                  active && "text-primary"
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                <span className="hidden md:inline">{item.name}</span>
                {item.external && <ExternalLink className="h-3 w-3 text-muted-foreground hidden md:inline" />}
                {active && (
                  <motion.div
                    layoutId="navbar-tubelight"
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-[3px]"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  >
                    <div className="w-full h-full bg-primary rounded-full" />
                    <div className="absolute w-full h-3 bg-primary/20 rounded-full blur-sm -top-1" />
                  </motion.div>
                )}
              </span>
            );

            if (item.hasDropdown) {
              return (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {navContent}
                  {hoveredItem === item.name && item.name === "CSSBuy" && <CSSBuyDropdown />}
                  {hoveredItem === item.name && item.name === "Catálogo" && <CatalogoDropdown />}
                </div>
              );
            }

            if (item.external) {
              return (
                <a
                  key={item.name}
                  href={suporteLink?.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {navContent}
                </a>
              );
            }

            return (
              <Link key={item.name} to={item.path || "/"}>
                {navContent}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Admin link */}
          {isAdmin && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/admin">
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent">
                    <Shield className="h-4 w-4" strokeWidth={1.5} />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent><p>Admin</p></TooltipContent>
            </Tooltip>
          )}

          {/* Theme Toggle */}
          {mounted && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent">
                  {resolvedTheme === "dark" ? (
                    <Sun className="h-4 w-4" strokeWidth={1.5} />
                  ) : (
                    <Moon className="h-4 w-4" strokeWidth={1.5} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>{resolvedTheme === "dark" ? "Tema claro" : "Tema escuro"}</p></TooltipContent>
            </Tooltip>
          )}

          {/* Notifications */}
          <NotificationDropdown />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1.5 px-2 hover:bg-accent">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium text-foreground">{displayName}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/perfil"><User className="mr-2 h-4 w-4" />Meu Perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/configuracoes"><Settings className="mr-2 h-4 w-4" />Configurações</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

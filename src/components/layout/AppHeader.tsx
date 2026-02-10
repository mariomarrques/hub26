import { Hexagon, ChevronDown, User, Settings, LogOut, Moon, Sun, ExternalLink, Home, ShoppingBag, LayoutGrid, Video, Headphones, Shield, LucideIcon } from "lucide-react";
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
import { useNavLinks, type NavLink } from "@/hooks/use-nav-links";
import { cn } from "@/lib/utils";
import { CSSBuyDropdown, CatalogoDropdown } from "./NavbarDropdowns";

const ICON_MAP: Record<string, LucideIcon> = {
  navbar_home: Home,
  navbar_cssbuy: ShoppingBag,
  navbar_catalogo: LayoutGrid,
  navbar_videos: Video,
  navbar_suporte: Headphones,
};

const DROPDOWN_KEYS = ["navbar_cssbuy", "navbar_catalogo"];

export function AppHeader() {
  const { profile, isAdmin, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const location = useLocation();
  const { getLinksByPosition } = useNavLinks();

  const navbarItems = getLinksByPosition("navbar");
  const suporteLink = getLinksByPosition("suporte")[0];

  useEffect(() => { setMounted(true); }, []);

  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const displayName = profile?.name || "Usuário";

  const isActive = (item: NavLink) => {
    if (item.url) return location.pathname === item.url;
    if (item.key === "navbar_cssbuy") return location.pathname === "/produtos";
    return false;
  };

  const getDropdownForItem = (item: NavLink) => {
    if (item.key === "navbar_cssbuy") return <CSSBuyDropdown />;
    if (item.key === "navbar_catalogo") return <CatalogoDropdown />;
    return null;
  };

  const getHref = (item: NavLink) => {
    if (item.key === "navbar_suporte") return suporteLink?.url || item.url || "#";
    return item.url || "#";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/60 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="flex h-full items-center justify-between px-4 md:px-6 max-w-[1440px] mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
          <Hexagon className="h-7 w-7 text-primary" strokeWidth={1.5} />
          <span className="text-lg font-bold text-foreground tracking-tight hidden sm:block">Hub 26</span>
        </Link>

        {/* Center Nav - Dynamic from DB */}
        <nav className="flex items-center gap-0.5 bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-full px-1.5 py-1 overflow-x-auto max-w-[55vw] md:max-w-none scrollbar-none">
          {navbarItems.map((item) => {
            const Icon = ICON_MAP[item.key] || LayoutGrid;
            const active = isActive(item);
            const hasDropdown = DROPDOWN_KEYS.includes(item.key);

            const navContent = (
              <span
                className={cn(
                  "relative cursor-pointer text-[13px] font-semibold px-2 md:px-4 py-2 rounded-full transition-all duration-200 ease-in-out flex items-center justify-center gap-1.5 whitespace-nowrap",
                  "text-foreground/60 hover:text-foreground/90",
                  active && "text-primary"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0 transition-all duration-200" strokeWidth={1.5} />
                <span className="hidden md:inline">{item.label}</span>
                {item.is_external && <ExternalLink className="h-3 w-3 text-muted-foreground hidden md:inline" />}
                {active && (
                  <motion.div
                    layoutId="navbar-tubelight"
                    className="absolute bottom-0 inset-x-0 flex justify-center pointer-events-none"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  >
                    <div className="w-6 h-[2.5px] bg-primary rounded-full" />
                    <div className="absolute w-8 h-3 bg-primary/15 rounded-full blur-md -top-0.5" />
                  </motion.div>
                )}
              </span>
            );

            if (hasDropdown) {
              return (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => setHoveredItem(item.key)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {navContent}
                  {hoveredItem === item.key && getDropdownForItem(item)}
                </div>
              );
            }

            if (item.is_external) {
              return (
                <a
                  key={item.id}
                  href={getHref(item)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {navContent}
                </a>
              );
            }

            return (
              <Link key={item.id} to={item.url || "/"}>
                {navContent}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0">
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

          <NotificationDropdown />

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

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
  children?: React.ReactNode;
  external?: boolean;
  onClick?: () => void;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
}

export function NavBar({ items, className }: NavBarProps) {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  // Determine active tab from current route
  const activeTab = items.find((item) => {
    if (item.url === "/produtos") return location.pathname === "/produtos";
    if (item.url === "/videos") return location.pathname === "/videos";
    return location.pathname === item.url;
  })?.name || "";

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={cn("flex items-center gap-1 bg-card/80 backdrop-blur-md border border-border rounded-full px-1 py-1", className)}>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.name;
        const isHovered = hoveredTab === item.name;

        const content = (
          <span
            className={cn(
              "relative cursor-pointer text-sm font-semibold px-4 py-2 rounded-full transition-colors flex items-center gap-2",
              "text-foreground/80 hover:text-primary",
              isActive && "bg-muted/30 text-primary"
            )}
          >
            <Icon className={cn("h-4 w-4", isMobile ? "" : "md:mr-0")} strokeWidth={1.5} />
            {!isMobile && <span>{item.name}</span>}
            {isActive && (
              <motion.div
                layoutId="tubelight"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="w-full h-full bg-primary rounded-full" />
                <div className="absolute w-full h-2 bg-primary/20 rounded-full blur-sm -top-0.5" />
              </motion.div>
            )}
          </span>
        );

        // If item has children (dropdown), wrap differently
        if (item.children) {
          return (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={() => setHoveredTab(item.name)}
              onMouseLeave={() => setHoveredTab(null)}
            >
              {content}
              {isHovered && item.children}
            </div>
          );
        }

        if (item.external) {
          return (
            <a
              key={item.name}
              href={item.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={item.onClick}
            >
              {content}
            </a>
          );
        }

        return (
          <Link key={item.name} to={item.url} onClick={item.onClick}>
            {content}
          </Link>
        );
      })}
    </div>
  );
}

export type { NavItem };

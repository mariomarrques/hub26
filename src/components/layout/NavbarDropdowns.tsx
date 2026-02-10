import { Link } from "react-router-dom";
import { ExternalLink, Package, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavLinks, type NavLink } from "@/hooks/use-nav-links";

interface DropdownProps {
  className?: string;
}

function DropdownItem({ link, highlight }: { link: NavLink; highlight?: boolean }) {
  const baseClass = cn(
    "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
    highlight
      ? "bg-primary/10 text-primary hover:bg-primary/20 font-semibold"
      : "text-foreground/80 hover:text-foreground hover:bg-accent/50",
    !link.url && "opacity-50 pointer-events-none"
  );

  if (link.is_external) {
    return (
      <a
        href={link.url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClass}
      >
        <span className="flex-1">{link.label}</span>
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
      </a>
    );
  }

  return (
    <Link to={link.url || "#"} className={baseClass}>
      <span>{link.label}</span>
    </Link>
  );
}

export function CSSBuyDropdown({ className }: DropdownProps) {
  const { getLinksByPosition } = useNavLinks();
  const links = getLinksByPosition("cssbuy");

  return (
    <div className={cn(
      "absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50",
      "w-52 bg-card border border-border rounded-xl shadow-xl p-2",
      "animate-fade-in",
      className
    )}>
      {links.map((link) => (
        <DropdownItem key={link.id} link={link} />
      ))}
      {links.length === 0 && (
        <p className="text-xs text-muted-foreground p-3 text-center">Nenhum link configurado</p>
      )}
    </div>
  );
}

export function CatalogoDropdown({ className }: DropdownProps) {
  const { getLinksByPosition } = useNavLinks();
  const links = getLinksByPosition("catalogo");

  return (
    <div className={cn(
      "absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50",
      "w-80 bg-card border border-border rounded-xl shadow-xl p-3",
      "animate-fade-in",
      className
    )}>
      <div className="grid grid-cols-2 gap-1">
        {links.map((link) => (
          <DropdownItem key={link.id} link={link} />
        ))}
      </div>
      {links.length === 0 && (
        <p className="text-xs text-muted-foreground p-3 text-center">Nenhum link configurado</p>
      )}
    </div>
  );
}

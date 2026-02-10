import { Link } from "react-router-dom";
import { ExternalLink, Package, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavLinks, type NavLink } from "@/hooks/use-nav-links";

interface DropdownProps {
  className?: string;
}

function DropdownItem({ link, highlight, subtitle }: { link: NavLink; highlight?: boolean; subtitle?: string }) {
  const baseClass = cn(
    "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
    highlight
      ? "bg-primary/10 text-primary hover:bg-primary/20 font-semibold"
      : "text-foreground/80 hover:text-foreground hover:bg-accent/50",
    !link.url && "opacity-50 pointer-events-none"
  );

  const content = (
    <>
      <span className="flex-1">
        {link.label}
        {subtitle && (
          <span className="block text-[10px] font-normal text-muted-foreground mt-0.5">{subtitle}</span>
        )}
      </span>
      {link.is_external && <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />}
    </>
  );

  if (link.is_external) {
    return (
      <a href={link.url || "#"} target="_blank" rel="noopener noreferrer" className={baseClass}>
        {content}
      </a>
    );
  }

  return (
    <Link to={link.url || "#"} className={baseClass}>
      {content}
    </Link>
  );
}

export function CSSBuyDropdown({ className }: DropdownProps) {
  const { getLinksByPosition } = useNavLinks();
  const links = getLinksByPosition("cssbuy");

  return (
    <div className={cn(
      "absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50",
      className
    )}>
      <div className="w-56 bg-card border border-border rounded-xl shadow-xl p-2">
        {links.map((link) => (
          <DropdownItem
            key={link.id}
            link={link}
            highlight={link.key === "cssbuy_fornecedor"}
            subtitle={link.key === "cssbuy_fornecedor" ? "senha: aaajersey" : undefined}
          />
        ))}
        {links.length === 0 && (
          <p className="text-xs text-muted-foreground p-3 text-center">Nenhum link configurado</p>
        )}
      </div>
    </div>
  );
}

export function CatalogoDropdown({ className }: DropdownProps) {
  const { getLinksByPosition } = useNavLinks();
  const links = getLinksByPosition("catalogo");

  return (
    <div className={cn(
      "absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50",
      className
    )}>
      <div className="w-80 bg-card border border-border rounded-xl shadow-xl p-3">
        <div className="grid grid-cols-2 gap-1">
          {links.map((link) => (
            <DropdownItem key={link.id} link={link} />
          ))}
        </div>
        {links.length === 0 && (
          <p className="text-xs text-muted-foreground p-3 text-center">Nenhum link configurado</p>
        )}
      </div>
    </div>
  );
}

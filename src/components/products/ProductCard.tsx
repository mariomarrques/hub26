import { Package, Pencil, Trash2, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/products/PriceDisplay";
import cssbuyLogo from "@/assets/cssbuy-logo.png";

export interface Product {
  id: string;
  name: string;
  image?: string;
  originPrice: string;
  status: string;
  category: string;
  adminNote?: string;
  affiliateLink?: string;
}

interface ProductCardProps {
  product: Product;
  index?: number;
  canManage?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onDuplicate?: (product: Product) => void;
}

export function ProductCard({ product, index = 0, canManage, onEdit, onDelete, onDuplicate }: ProductCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card bg-card/50",
        "transition-all duration-hover ease-hover",
        "hover:bg-card animate-slide-up"
      )}
      style={{ animationDelay: `${index * 75}ms` }}
    >
      {/* Image - clickable to details */}
      <Link to={`/produto/${product.id}`} className="relative aspect-square overflow-hidden bg-panel">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-hover group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground/30" strokeWidth={1.5} />
          </div>
        )}

        {/* Admin action buttons */}
        {canManage && (
          <div className="absolute top-sm right-sm flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground border-border"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDuplicate?.(product); }}
              title="Duplicar produto"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background border-border"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit?.(product); }}
              title="Editar produto"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground border-border"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete?.(product); }}
              title="Excluir produto"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-md">
        {/* Category tag */}
        {product.category && (
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">{product.category}</span>
        )}

        {/* Name */}
        <Link to={`/produto/${product.id}`}>
          <h3 className="mb-2 text-[14px] font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors duration-hover">
            {product.name}
          </h3>
        </Link>

        {/* Prices: Yuan + estimated BRL */}
        <PriceDisplay originPrice={product.originPrice} size="md" className="mb-3" />

        {/* CTA - Comprar via Agente */}
        <div className="mt-auto">
          {product.affiliateLink ? (
            <Button
              size="sm"
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(product.affiliateLink, '_blank', 'noopener,noreferrer');
              }}
            >
              <img src={cssbuyLogo} alt="CSSBuy" className="h-4 w-auto" />
              Comprar via Agente
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              asChild
            >
              <Link to={`/produto/${product.id}`}>
                Ver detalhes
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

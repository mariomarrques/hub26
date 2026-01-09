import { ExternalLink, Package, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusTag } from "@/components/ui/StatusTag";
import { Button } from "@/components/ui/button";

export interface Product {
  id: string;
  name: string;
  image?: string;
  originPrice: string;
  resaleRange: string;
  status: "hot" | "trending" | "new" | "paused";
  category: string;
  adminNote?: string;
  affiliateLink?: string;
}

interface ProductCardProps {
  product: Product;
  index?: number;
  onEdit?: () => void;
}

export function ProductCard({ product, index = 0, onEdit }: ProductCardProps) {
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card border border-border bg-card transition-all duration-hover ease-hover hover:bg-hover hover:border-primary/30 animate-slide-up"
      )}
      style={{ animationDelay: `${index * 75}ms` }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-panel">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-hover group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-12 w-12 text-text-muted/30" strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute left-sm top-sm">
          <StatusTag variant={product.status} />
        </div>
        
        {onEdit && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-md">
        {/* Category */}
        <span className="text-section-label mb-xs">{product.category}</span>

        {/* Name */}
        <h3 className="mb-sm text-[14px] font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-hover">
          {product.name}
        </h3>

        {/* Pricing */}
        <div className="mb-md space-y-xs">
          <div className="flex items-center justify-between">
            <span className="text-small">Origem</span>
            <span className="text-[14px] font-medium text-foreground">{product.originPrice}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-small">Revenda</span>
            <span className="text-[14px] font-semibold text-primary">{product.resaleRange}</span>
          </div>
        </div>

        {/* Admin Note */}
        {product.adminNote && (
          <p className="mb-md rounded-nav bg-panel p-sm text-small leading-relaxed">
            "{product.adminNote}"
          </p>
        )}

        {/* CTA */}
        <div className="mt-auto">
          <Button
            variant="secondary"
            size="sm"
            className="w-full gap-2 bg-card border border-border text-text-secondary transition-all duration-hover hover:bg-primary hover:text-primary-foreground hover:border-primary"
            asChild
          >
            <a href={product.affiliateLink || "#"} target="_blank" rel="noopener noreferrer">
              Ver produto
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}

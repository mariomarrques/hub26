import { ExternalLink, Package } from "lucide-react";
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
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 ease-out hover:border-primary/30 hover:shadow-card-hover animate-slide-up"
      )}
      style={{ animationDelay: `${index * 75}ms` }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <StatusTag variant={product.status} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category */}
        <span className="text-label mb-2">{product.category}</span>

        {/* Name */}
        <h3 className="mb-3 text-base font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Pricing */}
        <div className="mb-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Origem</span>
            <span className="text-sm font-medium text-foreground">{product.originPrice}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Revenda</span>
            <span className="text-sm font-semibold text-primary">{product.resaleRange}</span>
          </div>
        </div>

        {/* Admin Note */}
        {product.adminNote && (
          <p className="mb-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground leading-relaxed">
            "{product.adminNote}"
          </p>
        )}

        {/* CTA */}
        <div className="mt-auto">
          <Button
            variant="secondary"
            size="sm"
            className="w-full gap-2 transition-all duration-150 hover:bg-primary hover:text-primary-foreground"
            asChild
          >
            <a href={product.affiliateLink || "#"} target="_blank" rel="noopener noreferrer">
              Ver produto
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}

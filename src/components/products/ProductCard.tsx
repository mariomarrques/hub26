import { ArrowRight, Package, Pencil, Trash2, Copy } from "lucide-react";
import { Link } from "react-router-dom";
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
  canManage?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onDuplicate?: (product: Product) => void;
}

export function ProductCard({ product, index = 0, canManage, onEdit, onDelete, onDuplicate }: ProductCardProps) {
  return (
    <Link
      to={`/produto/${product.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card border border-border bg-card",
        "transition-all duration-hover ease-hover",
        "hover:bg-hover hover:border-primary hover:shadow-lg hover:-translate-y-1",
        "animate-slide-up"
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
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-hover pointer-events-none" />
        <div className="absolute left-sm top-sm">
          <StatusTag variant={product.status} />
        </div>

        {/* Admin/Mod action buttons */}
        {canManage && (
          <div className="absolute top-sm right-sm flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground border-border"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDuplicate?.(product);
              }}
              title="Duplicar produto"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background border-border"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit?.(product);
              }}
              title="Editar produto"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground border-border"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete?.(product);
              }}
              title="Excluir produto"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
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
            className="w-full gap-2 bg-card border border-border text-text-secondary transition-all duration-hover group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary"
          >
            Ver detalhes
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-hover group-hover:translate-x-1" strokeWidth={1.5} />
          </Button>
        </div>
      </div>
    </Link>
  );
}

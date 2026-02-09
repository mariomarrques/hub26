import { Package, Pencil, Trash2, Copy, Camera, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/products/PriceDisplay";
import cssbuyLogo from "@/assets/cssbuy-logo.png";

export interface ProductCardData {
  id: string;
  name: string;
  image?: string;
  originPrice: string;
  affiliateLink?: string;
  hasRealPhotos?: boolean;
}

interface ProductCardProps {
  product: ProductCardData;
  index?: number;
  canManage?: boolean;
  onEdit?: (product: ProductCardData) => void;
  onDelete?: (product: ProductCardData) => void;
  onDuplicate?: (product: ProductCardData) => void;
  onViewRealPhotos?: (product: ProductCardData) => void;
}

export function ProductCard({
  product,
  index = 0,
  canManage,
  onEdit,
  onDelete,
  onDuplicate,
  onViewRealPhotos,
}: ProductCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card",
        "bg-transparent",
        "transition-all duration-hover ease-hover",
        "hover:bg-card/30 animate-slide-up"
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Admin actions - top right overlay */}
      {canManage && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <Button
            size="icon"
            variant="secondary"
            className="h-7 w-7 bg-background/80 backdrop-blur-sm border-border hover:bg-primary hover:text-primary-foreground"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDuplicate?.(product); }}
            title="Copiar"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-7 w-7 bg-background/80 backdrop-blur-sm border-border hover:bg-primary hover:text-primary-foreground"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit?.(product); }}
            title="Editar"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-7 w-7 bg-background/80 backdrop-blur-sm border-border hover:bg-destructive hover:text-destructive-foreground"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete?.(product); }}
            title="Excluir"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Image */}
      <Link to={`/produto/${product.id}`} className="relative aspect-square overflow-hidden rounded-card bg-panel">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-hover group-hover:scale-105"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground/20" strokeWidth={1.5} />
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col pt-3 pb-1 px-1">
        {/* Name */}
        <Link to={`/produto/${product.id}`}>
          <h3 className="text-[14px] font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors duration-hover mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Dual price display */}
        <PriceDisplay originPrice={product.originPrice} size="md" className="mb-3" />

        {/* CTA */}
        <div className="mt-auto space-y-2">
          {product.affiliateLink ? (
            <Button
              size="sm"
              className="w-full gap-2 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(product.affiliateLink, "_blank", "noopener,noreferrer");
              }}
            >
              <img src={cssbuyLogo} alt="CSSBuy" className="h-4 w-auto" />
              Comprar via CSSBuy
              <ExternalLink className="h-3 w-3 ml-auto opacity-60" />
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to={`/produto/${product.id}`}>Ver detalhes</Link>
            </Button>
          )}

          {/* Real photos link */}
          {product.hasRealPhotos && (
            <button
              className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors py-1"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onViewRealPhotos?.(product);
              }}
            >
              <Camera className="h-3 w-3" />
              Ver fotos reais
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import { Package, Pencil, Trash2, Copy, Camera, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/products/PriceDisplay";

export interface ProductCardData {
  id: string;
  name: string;
  image?: string;
  originPrice: string;
  affiliateLink?: string;
  hasRealPhotos?: boolean;
  realPhotosCount?: number;
  adminNote?: string;
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

        {/* Real photos badge on image */}
        {product.hasRealPhotos && product.realPhotosCount && product.realPhotosCount > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-foreground">
            <Camera className="h-3 w-3" />
            <span>{product.realPhotosCount}</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col pt-3 pb-1 px-1">
        {/* Name - bigger and bolder */}
        <Link to={`/produto/${product.id}`}>
          <h3 className="text-base font-bold text-foreground line-clamp-2 hover:text-primary transition-colors duration-hover mb-1">
            {product.name}
          </h3>
        </Link>

        {/* Admin note / observations - lighter, below title */}
        {product.adminNote && (
          <p className="text-xs text-muted-foreground font-normal line-clamp-2 mb-2">
            {product.adminNote}
          </p>
        )}

        {/* Dual price display */}
        <PriceDisplay originPrice={product.originPrice} size="md" className="mb-3" />

        {/* CTA */}
        <div className="mt-auto space-y-2">
          {product.affiliateLink ? (
            <Button
              size="sm"
              className="w-full justify-center items-center gap-2 font-bold text-[13px] bg-primary hover:bg-primary/80 text-primary-foreground transition-all duration-200"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(product.affiliateLink, "_blank", "noopener,noreferrer");
              }}
            >
              Comprar via CSSBuy
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to={`/produto/${product.id}`}>Ver detalhes</Link>
            </Button>
          )}

          {/* Real photos button */}
          {product.hasRealPhotos && product.realPhotosCount && product.realPhotosCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full justify-center gap-2 font-semibold text-[13px] bg-muted/80 hover:bg-muted text-foreground"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onViewRealPhotos?.(product);
              }}
            >
              <Camera className="h-3.5 w-3.5" />
              Ver Fotos Reais ({product.realPhotosCount})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Store, Plus, AlertTriangle, ShoppingCart, Loader2, Package, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusTag } from "@/components/ui/StatusTag";
import { BazarProductFormDialog } from "@/components/bazar/BazarProductFormDialog";
import { useBazarProducts, BazarProduct } from "@/hooks/use-bazar-products";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

function StockBar({ stock, maxStock }: { stock: number; maxStock: number }) {
  const percentage = (stock / maxStock) * 100;
  const isLow = percentage < 20;
  const isMedium = percentage >= 20 && percentage < 50;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Estoque</span>
        <span className={cn(
          "font-medium",
          isLow ? "text-hot" : isMedium ? "text-warning" : "text-success"
        )}>
          {stock} unidades
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isLow ? "bg-hot" : isMedium ? "bg-warning" : "bg-success"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface BazarCardProps {
  product: BazarProduct;
  index: number;
  canManage?: boolean;
  onEdit?: () => void;
}

function BazarCard({ product, index, canManage, onEdit }: BazarCardProps) {
  const isLowStock = (product.stock / product.max_stock) < 0.2;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 ease-out hover:border-primary/30 hover:shadow-card-hover animate-slide-up"
      )}
      style={{ animationDelay: `${index * 75}ms` }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          {isLowStock && <StatusTag variant="hot">Últimas unidades</StatusTag>}
          {product.is_kit && <StatusTag variant="new">Kit {product.kit_items}x</StatusTag>}
        </div>
        
        {canManage && onEdit && (
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
      <div className="flex flex-1 flex-col p-4">
        <span className="text-label mb-2 flex items-center gap-1.5">
          <Store className="h-3 w-3" />
          Bazar do Marin
        </span>

        <h3 className="mb-3 text-base font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-primary">{product.price}</span>
            {product.original_price && (
              <span className="text-sm text-muted-foreground line-through">{product.original_price}</span>
            )}
          </div>
        </div>

        {/* Stock */}
        <div className="mb-4">
          <StockBar stock={product.stock} maxStock={product.max_stock} />
        </div>

        {/* CTA */}
        <Button
          className="w-full gap-2 mt-auto"
          variant={isLowStock ? "default" : "secondary"}
        >
          <ShoppingCart className="h-4 w-4" />
          Comprar Agora
        </Button>
      </div>
    </article>
  );
}

const Bazar = () => {
  const { data: products, isLoading } = useBazarProducts();
  const { isAdmin, isModerator } = useAuth();
  const canManage = isAdmin || isModerator;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<BazarProduct | null>(null);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  const handleEditProduct = (product: BazarProduct) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const hasLowStock = products?.some(p => (p.stock / p.max_stock) < 0.2);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="animate-fade-in">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Store className="h-5 w-5 text-primary" />
              <p className="text-label">Pronta Entrega</p>
            </div>
            <h1 className="text-heading text-foreground mb-2">
              Bazar do Marin
            </h1>
            <p className="text-body-muted">
              Produtos com estoque no Brasil. Compra rápida, entrega imediata.
            </p>
          </div>

          {canManage && (
            <Button className="gap-2" onClick={handleAddProduct}>
              <Plus className="h-4 w-4" />
              Adicionar Produto
            </Button>
          )}
        </div>
      </header>

      {/* Low Stock Alert */}
      {hasLowStock && (
        <div className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
          <p className="text-sm text-foreground">
            <span className="font-medium">Atenção:</span> Alguns produtos estão com estoque limitado. Garanta o seu antes que acabe.
          </p>
        </div>
      )}

      {/* Products Grid */}
      <section>
        {products && products.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <BazarCard 
                key={product.id} 
                product={product} 
                index={index}
                canManage={canManage}
                onEdit={() => handleEditProduct(product)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">
              Nenhum produto no bazar ainda.
            </p>
            {canManage && (
              <Button variant="outline" onClick={handleAddProduct}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar primeiro produto
              </Button>
            )}
          </div>
        )}
      </section>

      <BazarProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={selectedProduct}
      />
    </div>
  );
};

export default Bazar;

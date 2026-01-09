import { Store, Package, AlertTriangle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusTag } from "@/components/ui/StatusTag";
import { cn } from "@/lib/utils";

interface BazarProduct {
  id: string;
  name: string;
  image: string;
  price: string;
  originalPrice?: string;
  stock: number;
  maxStock: number;
  isKit?: boolean;
  kitItems?: number;
}

const bazarProducts: BazarProduct[] = [
  {
    id: "1",
    name: "Camisa Polo Premium - Pronta Entrega",
    image: "https://images.unsplash.com/photo-1625910513413-5fc7974e9b3c?w=400&q=80",
    price: "R$ 89,90",
    originalPrice: "R$ 120,00",
    stock: 12,
    maxStock: 50,
  },
  {
    id: "2",
    name: "Kit 3 Camisetas Streetwear",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80",
    price: "R$ 149,90",
    stock: 5,
    maxStock: 20,
    isKit: true,
    kitItems: 3,
  },
  {
    id: "3",
    name: "Óculos de Sol Vintage - Últimas Unidades",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=80",
    price: "R$ 45,00",
    stock: 3,
    maxStock: 30,
  },
  {
    id: "4",
    name: "Relógio Minimalista Black Edition",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80",
    price: "R$ 79,90",
    stock: 8,
    maxStock: 25,
  },
];

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

function BazarCard({ product, index }: { product: BazarProduct; index: number }) {
  const isLowStock = (product.stock / product.maxStock) < 0.2;

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
          {product.isKit && <StatusTag variant="new">Kit {product.kitItems}x</StatusTag>}
        </div>
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
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">{product.originalPrice}</span>
            )}
          </div>
        </div>

        {/* Stock */}
        <div className="mb-4">
          <StockBar stock={product.stock} maxStock={product.maxStock} />
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
  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="animate-fade-in">
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
      </header>

      {/* Low Stock Alert */}
      <div className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
        <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
        <p className="text-sm text-foreground">
          <span className="font-medium">Atenção:</span> Alguns produtos estão com estoque limitado. Garanta o seu antes que acabe.
        </p>
      </div>

      {/* Products Grid */}
      <section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {bazarProducts.map((product, index) => (
            <BazarCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Bazar;

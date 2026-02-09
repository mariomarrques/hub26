import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRelatedProducts, ProductWithCategory } from "@/hooks/use-products";
import { PriceDisplay } from "@/components/products/PriceDisplay";

interface RelatedProductsProps {
  categoryId: string;
  excludeProductId: string;
  categoryName?: string;
  categorySlug?: string;
}

export function RelatedProducts({ 
  categoryId, 
  excludeProductId, 
  categoryName,
}: RelatedProductsProps) {
  const { data: products = [], isLoading } = useRelatedProducts(categoryId, excludeProductId);

  if (isLoading) {
    return (
      <div className="mt-12">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {categoryName ? `Mais em ${categoryName}` : "Produtos Relacionados"}
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <RelatedProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function RelatedProductCard({ product }: { product: ProductWithCategory }) {
  return (
    <Link to={`/produto/${product.id}`}>
      <Card className="group overflow-hidden hover:shadow-md transition-all duration-200 h-full bg-card/50 hover:bg-card border-0">
        <CardContent className="p-0">
          <div className="relative aspect-square overflow-hidden bg-panel">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
              onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
            />
          </div>
          <div className="p-3">
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <PriceDisplay originPrice={product.origin_price} size="sm" className="mt-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

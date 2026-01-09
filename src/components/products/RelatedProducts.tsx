import { Link } from "react-router-dom";
import { ArrowRight, Flame, TrendingUp, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRelatedProducts, ProductWithCategory } from "@/hooks/use-products";

const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  hot: { label: "Hot", icon: Flame, className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  trending: { label: "Trending", icon: TrendingUp, className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  new: { label: "Novo", icon: Sparkles, className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
};

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
  categorySlug 
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

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {categoryName ? `Mais em ${categoryName}` : "Produtos Relacionados"}
        </h2>
        {categorySlug && (
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/categoria/${categorySlug}`}>
              Ver todos
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        )}
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
  const status = statusConfig[product.status] || statusConfig.new;
  const StatusIcon = status.icon;

  return (
    <Link to={`/produto/${product.id}`}>
      <Card className="group overflow-hidden hover:shadow-md transition-all duration-200 h-full">
        <CardContent className="p-0">
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
            <Badge className={`absolute top-2 left-2 text-xs ${status.className}`}>
              <StatusIcon className="mr-1 h-2.5 w-2.5" />
              {status.label}
            </Badge>
          </div>
          <div className="p-3">
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-primary font-semibold mt-1">
              {product.resale_range}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

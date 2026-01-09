import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Tag, TrendingUp, Flame, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useProduct } from "@/hooks/use-products";
import { RelatedProducts } from "@/components/products/RelatedProducts";

const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  hot: { label: "Hot", icon: Flame, className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  trending: { label: "Trending", icon: TrendingUp, className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  new: { label: "Novo", icon: Sparkles, className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
};

export default function Produto() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProduct(id || "");

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Produto não encontrado.</p>
            <Button variant="outline" onClick={() => navigate("/busca")} className="mt-4">
              Ir para busca
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusConfig[product.status] || statusConfig.new;
  const StatusIcon = status.icon;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Início</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/busca">Busca</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 -ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      {/* Product Content */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative">
          <div className="aspect-square overflow-hidden rounded-xl border bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          </div>
          {/* Status Badge on Image */}
          <Badge className={`absolute top-4 left-4 ${status.className}`}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {status.label}
          </Badge>
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          {/* Category */}
          {product.category && (
            <Link 
              to={`/categoria/${product.category.slug}`}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-2"
            >
              <Tag className="mr-1.5 h-3.5 w-3.5" />
              {product.category.name}
            </Link>
          )}

          {/* Product Name */}
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            {product.name}
          </h1>

          {/* Pricing Card */}
          <Card className="mb-6">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Preço de Origem</span>
                <span className="font-medium">{product.origin_price}</span>
              </div>
              <div className="border-t" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Faixa de Revenda</span>
                <span className="font-semibold text-primary">{product.resale_range}</span>
              </div>
            </CardContent>
          </Card>

          {/* Admin Note */}
          {product.admin_note && (
            <Card className="mb-6 border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Nota do Admin</p>
                    <p className="text-sm text-muted-foreground">{product.admin_note}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA Button */}
          <div className="mt-auto">
            {product.affiliate_link && product.affiliate_link !== "#" ? (
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => window.open(product.affiliate_link!, "_blank")}
              >
                Ver na Loja
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button size="lg" className="w-full" disabled>
                Link não disponível
              </Button>
            )}
          </div>

          {/* Timestamps */}
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Adicionado em {new Date(product.created_at || "").toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>

      {/* Related Products */}
      {product.category_id && (
        <RelatedProducts
          categoryId={product.category_id}
          excludeProductId={product.id}
          categoryName={product.category?.name}
          categorySlug={product.category?.slug}
        />
      )}
    </div>
  );
}

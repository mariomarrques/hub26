import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Tag, Package, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useProduct } from "@/hooks/use-products";
import { RelatedProducts } from "@/components/products/RelatedProducts";
import { PriceDisplay } from "@/components/products/PriceDisplay";
import { ProductVideoSection } from "@/components/videos/ProductVideoSection";
import cssbuyLogo from "@/assets/cssbuy-logo.png";

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
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-12 w-12 text-muted-foreground/30 mb-4" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold text-foreground mb-2">Produto não encontrado</h3>
          <p className="text-sm text-muted-foreground">Este produto pode ter sido removido.</p>
          <Button variant="outline" onClick={() => navigate("/produtos")} className="mt-4">
            Ver todos os produtos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link to="/">Início</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link to="/produtos">Produtos</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 -ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-square overflow-hidden rounded-xl border bg-panel">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          {product.category && (
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
              <Tag className="inline mr-1.5 h-3.5 w-3.5" />
              {product.category.name}
            </span>
          )}

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            {product.name}
          </h1>

          {/* Price Card with ¥ + R$ */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <PriceDisplay originPrice={product.origin_price} size="lg" />
              <p className="text-xs text-muted-foreground mt-1">
                Valor em R$ estimado com base na cotação do dia
              </p>
            </CardContent>
          </Card>

          {product.description && (
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{product.description}</p>
          )}

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

          {/* CTA */}
          <div className="mt-auto">
            {product.affiliate_link && product.affiliate_link !== "#" ? (
              <Button
                size="lg"
                className="w-full gap-3 font-semibold text-base"
                onClick={() => window.open(product.affiliate_link!, "_blank", "noopener,noreferrer")}
              >
                <img src={cssbuyLogo} alt="CSSBuy" className="h-5 w-auto" />
                Comprar via Agente
              </Button>
            ) : (
              <Button size="lg" className="w-full" disabled>
                Link não disponível
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            Adicionado em {new Date(product.created_at || "").toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>

      {/* Product Videos */}
      <ProductVideoSection productId={product.id} />

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

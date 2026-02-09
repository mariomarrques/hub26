import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Home, Search, X, Package, AlertTriangle } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductCardSkeleton } from "@/components/products/ProductCardSkeleton";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";

const Index = () => {
  const { isAdmin, isModerator } = useAuth();
  const { data: products, isLoading, error } = useProducts();
  const { categories } = useCategories();

  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const debouncedSearch = useDebounce(search, 300);

  // Build available tags from categories + product tags
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    categories?.forEach((c) => tagSet.add(c.name));
    products?.forEach((p) => {
      if ((p as any).tags) {
        ((p as any).tags as string[]).forEach((t) => tagSet.add(t));
      }
    });
    return Array.from(tagSet).sort();
  }, [categories, products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      // Text search
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        if (!p.name.toLowerCase().includes(q)) return false;
      }
      // Tag filter
      if (selectedTags.length > 0) {
        const productTags = new Set<string>();
        if ((p as any).tags) {
          ((p as any).tags as string[]).forEach((t) => productTags.add(t));
        }
        // Also match by category
        const cat = categories?.find((c) => c.id === p.category_id);
        if (cat) productTags.add(cat.name);
        
        if (!selectedTags.some((tag) => productTags.has(tag))) return false;
      }
      return true;
    });
  }, [products, debouncedSearch, selectedTags, categories]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedTags([]);
  };

  const canManage = isAdmin || isModerator;
  const hasActiveFilters = debouncedSearch || selectedTags.length > 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb className="animate-fade-in">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Produtos</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-page-title">Produtos</h1>
        <p className="text-sm text-muted-foreground">
          Encontre produtos para revenda através do seu agente de compras
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar produtos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-9"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tag Filters */}
      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer transition-colors hover:bg-primary/20"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs text-muted-foreground">
              <X className="h-3 w-3 mr-1" />
              Limpar filtros
            </Button>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Erro ao carregar produtos</h3>
          <p className="text-sm text-muted-foreground">Tente novamente em alguns instantes.</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Product Grid */}
      {!isLoading && !error && (
        <>
          {filteredProducts.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    image: product.image,
                    originPrice: product.origin_price,
                    status: product.status as any,
                    category: categories?.find((c) => c.id === product.category_id)?.name || "",
                    adminNote: product.admin_note || undefined,
                    affiliateLink: product.affiliate_link || undefined,
                  }}
                  index={index}
                  canManage={canManage}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-12 w-12 text-muted-foreground/30 mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {hasActiveFilters ? "Nenhum produto encontrado" : "Nenhum produto disponível"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {hasActiveFilters
                  ? "Tente ajustar seus filtros ou busca para encontrar o que procura."
                  : "Novos produtos serão adicionados em breve."}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                  Limpar filtros
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Index;

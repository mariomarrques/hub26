import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/products/ProductCard";
import { useCategories } from "@/hooks/use-categories";
import { useProducts, Product } from "@/hooks/use-products";
import { normalizeSearch } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const parsePrice = (priceStr: string): number => {
  const match = priceStr.match(/[\d.,]+/);
  if (!match) return 0;
  return parseFloat(match[0].replace(".", "").replace(",", "."));
};

const parseMinResale = (rangeStr: string): number => {
  const match = rangeStr.match(/[\d]+/);
  return match ? parseInt(match[0]) : 0;
};

const statusFilters = [
  { value: "all", label: "Todos" },
  { value: "hot", label: "🔥 Quente" },
  { value: "trending", label: "📈 Em Alta" },
  { value: "new", label: "✨ Novo" },
];

const sortOptions = [
  { value: "relevancia", label: "Relevância" },
  { value: "nome-az", label: "Nome A-Z" },
  { value: "nome-za", label: "Nome Z-A" },
  { value: "menor-preco", label: "Menor Preço" },
  { value: "maior-preco", label: "Maior Preço" },
  { value: "maior-margem", label: "Maior Margem" },
];

// Transform database product to ProductCard format
const transformProduct = (product: Product, categoryName: string) => ({
  id: product.id,
  name: product.name,
  image: product.image,
  originPrice: product.origin_price,
  resaleRange: product.resale_range,
  status: product.status as "hot" | "trending" | "new" | "paused",
  category: categoryName,
  adminNote: product.admin_note ?? undefined,
  affiliateLink: product.affiliate_link ?? undefined,
});

const Categoria = () => {
  const { slug } = useParams<{ slug: string }>();
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("relevancia");
  const [searchQuery, setSearchQuery] = useState("");

  const { categories, isLoading: categoriesLoading } = useCategories();
  const category = categories.find((c) => c.slug === slug);

  const { data: products = [], isLoading: productsLoading } = useProducts(category?.id);

  const filteredProducts = useMemo(() => {
    if (!category) return [];

    let result = products.map((p) => transformProduct(p, category.name));

    // Filtro por nome (busca)
    if (searchQuery.trim()) {
      const normalizedQuery = normalizeSearch(searchQuery);
      result = result.filter((p) =>
        normalizeSearch(p.name).includes(normalizedQuery)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    switch (sortOrder) {
      case "nome-az":
        result.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
        break;
      case "nome-za":
        result.sort((a, b) => b.name.localeCompare(a.name, "pt-BR"));
        break;
      case "menor-preco":
        result.sort((a, b) => parsePrice(a.originPrice) - parsePrice(b.originPrice));
        break;
      case "maior-preco":
        result.sort((a, b) => parsePrice(b.originPrice) - parsePrice(a.originPrice));
        break;
      case "maior-margem":
        result.sort((a, b) => {
          const margemA = parseMinResale(a.resaleRange) - parsePrice(a.originPrice);
          const margemB = parseMinResale(b.resaleRange) - parsePrice(b.originPrice);
          return margemB - margemA;
        });
        break;
    }

    return result;
  }, [category, products, searchQuery, statusFilter, sortOrder]);

  const isLoading = categoriesLoading || productsLoading;

  if (categoriesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Categoria não encontrada
        </h1>
        <Link to="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para o início
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="animate-fade-in">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2 mb-4 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-heading text-foreground mb-2">{category.name}</h1>
        <p className="text-body-muted">
          {filteredProducts.length} {filteredProducts.length === 1 ? "produto" : "produtos"} nesta categoria
        </p>
      </header>

      {/* Search */}
      <section className="animate-slide-up" style={{ animationDelay: "50ms" }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar produto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </section>

      {/* Filters */}
      <section className="animate-slide-up" style={{ animationDelay: "100ms" }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(filter.value)}
                className="transition-all"
              >
                {filter.label}
              </Button>
            ))}
          </div>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Products Grid */}
      <section>
        {productsLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground mb-2">
              Nenhum produto encontrado com os filtros selecionados.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter("all");
                setSearchQuery("");
              }}
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Categoria;

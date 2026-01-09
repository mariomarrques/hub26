import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Search, Plus, Loader2, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFormDialog } from "@/components/products/ProductFormDialog";
import { useCategory } from "@/hooks/use-categories";
import { useProducts, ProductWithCategory } from "@/hooks/use-products";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeSearch } from "@/lib/utils";

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

const Categoria = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: category, isLoading: categoryLoading } = useCategory(slug);
  const { data: products, isLoading: productsLoading } = useProducts(slug);
  const { isAdmin, isModerator } = useAuth();
  const canManage = isAdmin || isModerator;

  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("relevancia");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithCategory | null>(null);

  const isLoading = categoryLoading || productsLoading;

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    let filtered = [...products];

    // Filtro por nome (busca)
    if (searchQuery.trim()) {
      const normalizedQuery = normalizeSearch(searchQuery);
      filtered = filtered.filter((p) => 
        normalizeSearch(p.name).includes(normalizedQuery)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    switch (sortOrder) {
      case "nome-az":
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
        break;
      case "nome-za":
        filtered.sort((a, b) => b.name.localeCompare(a.name, 'pt-BR'));
        break;
      case "menor-preco":
        filtered.sort((a, b) => parsePrice(a.origin_price) - parsePrice(b.origin_price));
        break;
      case "maior-preco":
        filtered.sort((a, b) => parsePrice(b.origin_price) - parsePrice(a.origin_price));
        break;
      case "maior-margem":
        filtered.sort((a, b) => {
          const margemA = parseMinResale(a.resale_range) - parsePrice(a.origin_price);
          const margemB = parseMinResale(b.resale_range) - parsePrice(b.origin_price);
          return margemB - margemA;
        });
        break;
    }

    return filtered;
  }, [products, searchQuery, statusFilter, sortOrder]);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  const handleEditProduct = (product: ProductWithCategory) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Categoria não encontrada
        </h1>
        <Link to="/produtos">
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
        <div className="flex items-start justify-between">
          <div>
            <Link to="/produtos">
              <Button variant="ghost" size="sm" className="gap-2 mb-4 -ml-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-heading text-foreground mb-2">{category.name}</h1>
            <p className="text-body-muted">
              {filteredProducts.length} {filteredProducts.length === 1 ? "produto" : "produtos"} nesta categoria
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
        {filteredProducts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={{
                  id: product.id,
                  name: product.name,
                  image: product.image,
                  originPrice: product.origin_price,
                  resaleRange: product.resale_range,
                  status: product.status as "hot" | "trending" | "new",
                  category: product.categories?.name || "",
                  adminNote: product.admin_note || undefined,
                  affiliateLink: product.affiliate_link || undefined,
                }} 
                index={index}
                onEdit={canManage ? () => handleEditProduct(product) : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">
              {products?.length === 0 
                ? "Nenhum produto cadastrado nesta categoria." 
                : "Nenhum produto encontrado com os filtros selecionados."}
            </p>
            {products?.length === 0 && canManage ? (
              <Button variant="outline" onClick={handleAddProduct}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar primeiro produto
              </Button>
            ) : products?.length !== 0 && (
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
            )}
          </div>
        )}
      </section>

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={selectedProduct}
        defaultCategoryId={category.id}
      />
    </div>
  );
};

export default Categoria;

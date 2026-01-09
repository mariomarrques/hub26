import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/ProductCard";
import { categories, mockProducts } from "@/data/mockData";
import { normalizeSearch } from "@/lib/utils";

const statusFilters = [
  { value: "all", label: "Todos" },
  { value: "hot", label: "🔥 Hot" },
  { value: "trending", label: "📈 Trending" },
  { value: "new", label: "✨ Novo" },
];

const Categoria = () => {
  const { slug } = useParams<{ slug: string }>();
  const [statusFilter, setStatusFilter] = useState("all");

  const category = categories.find((c) => c.slug === slug);

  const filteredProducts = useMemo(() => {
    if (!category) return [];
    
    let products = mockProducts.filter(
      (p) => normalizeSearch(p.category) === normalizeSearch(category.name)
    );

    if (statusFilter !== "all") {
      products = products.filter((p) => p.status === statusFilter);
    }

    return products;
  }, [category, statusFilter]);

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

      {/* Filters */}
      <section className="animate-slide-up" style={{ animationDelay: "100ms" }}>
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
      </section>

      {/* Products Grid */}
      <section>
        {filteredProducts.length > 0 ? (
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
              onClick={() => setStatusFilter("all")}
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

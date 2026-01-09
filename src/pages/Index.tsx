import { CategoryCard } from "@/components/categories/CategoryCard";
import { categories } from "@/data/mockData";

const Index = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="animate-fade-in">
        <p className="text-label mb-2">Painel de Execução</p>
        <h1 className="text-heading text-foreground mb-2">
          Bem-vindo de volta
        </h1>
        <p className="text-body-muted">
          Veja os avisos antes de decidir. Produtos atualizados diariamente.
        </p>
      </header>

      {/* Categories Grid */}
      <section className="animate-slide-up" style={{ animationDelay: "100ms" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Categorias</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Explore por tipo de produto
            </p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;

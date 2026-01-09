import { useState } from "react";
import { Plus } from "lucide-react";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { CategoryFormDialog } from "@/components/categories/CategoryFormDialog";
import { useCategories } from "@/hooks/use-categories";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { isAdmin, isModerator } = useAuth();
  const { categories, isLoading } = useCategories();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
          {(isAdmin || isModerator) && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          )}
        </div>
        
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <CategoryCard key={category.id} category={category} index={index} />
            ))}
          </div>
        )}
      </section>

      <CategoryFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
};

export default Index;

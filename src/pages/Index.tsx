import { useState } from "react";
import { Plus, FolderOpen, Loader2 } from "lucide-react";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { CategoryFormDialog } from "@/components/categories/CategoryFormDialog";
import { useCategories, Category } from "@/hooks/use-categories";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { data: categories, isLoading } = useCategories();
  const { isAdmin, isModerator } = useAuth();
  const canManage = isAdmin || isModerator;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="animate-fade-in">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-label mb-2">Painel de Execução</p>
            <h1 className="text-heading text-foreground mb-2">
              Bem-vindo de volta
            </h1>
            <p className="text-body-muted">
              Veja os avisos antes de decidir. Produtos atualizados diariamente.
            </p>
          </div>

          {canManage && (
            <Button className="gap-2" onClick={handleAddCategory}>
              <Plus className="h-4 w-4" />
              Adicionar Categoria
            </Button>
          )}
        </div>
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

        {categories && categories.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <CategoryCard 
                key={category.id} 
                category={category} 
                index={index}
                onEdit={canManage ? () => handleEditCategory(category) : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">
              Nenhuma categoria cadastrada ainda.
            </p>
            {canManage && (
              <Button variant="outline" onClick={handleAddCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira categoria
              </Button>
            )}
          </div>
        )}
      </section>

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={selectedCategory}
      />
    </div>
  );
};

export default Index;

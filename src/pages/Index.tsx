import { AlertCard } from "@/components/alerts/AlertCard";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { mockAlerts, categories } from "@/data/mockData";
import { Bell, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const urgentAlerts = mockAlerts.filter((alert) => alert.isNew).slice(0, 2);

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

      {/* Urgent Alerts Banner */}
      {urgentAlerts.length > 0 && (
        <section className="animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-hot" />
              <h2 className="text-sm font-semibold text-foreground">Avisos Importantes</h2>
            </div>
            <Link to="/avisos">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-primary">
                Ver todos
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {urgentAlerts.map((alert, index) => (
              <AlertCard key={alert.id} alert={alert} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Categories Grid */}
      <section className="animate-slide-up" style={{ animationDelay: "200ms" }}>
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

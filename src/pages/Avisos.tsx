import { AlertCard } from "@/components/alerts/AlertCard";
import { mockAlerts } from "@/data/mockData";
import { Bell, Filter } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const filterOptions = ["Todos", "Urgente", "Informativo", "Sucesso"];

const Avisos = () => {
  const [activeFilter, setActiveFilter] = useState("Todos");

  const filteredAlerts = mockAlerts.filter((alert) => {
    if (activeFilter === "Todos") return true;
    if (activeFilter === "Urgente") return alert.type === "urgent" || alert.type === "warning";
    if (activeFilter === "Informativo") return alert.type === "info";
    if (activeFilter === "Sucesso") return alert.type === "success";
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="h-5 w-5 text-primary" />
          <p className="text-label">Canal de Alertas</p>
        </div>
        <h1 className="text-heading text-foreground mb-2">
          Avisos Importantes
        </h1>
        <p className="text-body-muted">
          Fique por dentro de mudanças, alertas e atualizações críticas.
        </p>
      </header>

      {/* Filters */}
      <section className="animate-slide-up" style={{ animationDelay: "100ms" }}>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
            <Filter className="h-3.5 w-3.5" />
            <span className="text-label">Filtrar</span>
          </div>
          {filterOptions.map((option) => (
            <button
              key={option}
              onClick={() => setActiveFilter(option)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150",
                activeFilter === option
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </section>

      {/* Alerts List */}
      <section className="space-y-3">
        {filteredAlerts.map((alert, index) => (
          <AlertCard key={alert.id} alert={alert} index={index} />
        ))}
        {filteredAlerts.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-muted-foreground">Nenhum aviso encontrado com esse filtro.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Avisos;

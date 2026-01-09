import { useState } from "react";
import { Users, Star, Truck, CheckCircle, Pause, Sparkles, Plus, ExternalLink, Pencil } from "lucide-react";
import { mockSuppliers, Supplier } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SupplierFormDialog } from "@/components/suppliers/SupplierFormDialog";
import { toast } from "sonner";

function RatingBar({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-xs font-medium text-foreground">{value.toFixed(1)}</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(value / 5) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Supplier["status"] }) {
  const config = {
    active: { icon: CheckCircle, label: "Confiável", className: "bg-success/15 text-success border-success/20" },
    paused: { icon: Pause, label: "Pausado", className: "bg-muted/50 text-muted-foreground border-muted" },
    new: { icon: Sparkles, label: "Novo", className: "bg-primary/15 text-primary border-primary/20" },
  };

  const { icon: Icon, label, className } = config[status];

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", className)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

interface SupplierCardProps {
  supplier: Supplier;
  index: number;
  isAdmin?: boolean;
  onEdit?: () => void;
}

function SupplierCard({ supplier, index, isAdmin, onEdit }: SupplierCardProps) {
  const avgRating = (supplier.rating.quality + supplier.rating.delivery) / 2;

  return (
    <article
      className={cn(
        "rounded-xl border border-border bg-card p-5 transition-all duration-200 ease-out hover:border-primary/30 hover:shadow-card-hover animate-slide-up",
        supplier.status === "paused" && "opacity-70"
      )}
      style={{ animationDelay: `${index * 75}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground mb-1">{supplier.name}</h3>
          <div className="flex items-center gap-2">
            <StatusBadge status={supplier.status} />
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-warning text-warning" />
              {avgRating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {supplier.categories.map((cat) => (
          <span key={cat} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {cat}
          </span>
        ))}
      </div>

      {/* Ratings */}
      <div className="space-y-3 mb-4">
        <RatingBar label="Qualidade" value={supplier.rating.quality} icon={Star} />
        <RatingBar label="Prazo de Entrega" value={supplier.rating.delivery} icon={Truck} />
      </div>

      {/* Admin Note */}
      {supplier.adminNote && (
        <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground leading-relaxed">
          "{supplier.adminNote}"
        </p>
      )}

      {/* Footer Buttons */}
      <div className="mt-4 pt-3 border-t border-border flex gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 justify-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4" />
          Ver detalhes
        </Button>
        {isAdmin && onEdit && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onEdit}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        )}
      </div>
    </article>
  );
}

const Fornecedores = () => {
  const { isAdmin } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  
  const activeSuppliers = suppliers.filter((s) => s.status === "active");
  const otherSuppliers = suppliers.filter((s) => s.status !== "active");

  const handleOpenAddDialog = () => {
    setSelectedSupplier(null);
    setDialogMode("add");
    setDialogOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleAddSupplier = (newSupplier: Omit<Supplier, "id">) => {
    const supplier: Supplier = {
      ...newSupplier,
      id: crypto.randomUUID(),
    };
    setSuppliers([supplier, ...suppliers]);
    toast.success("Fornecedor adicionado com sucesso!");
    setDialogOpen(false);
  };

  const handleUpdateSupplier = (updatedData: Omit<Supplier, "id">) => {
    if (!selectedSupplier) return;
    
    setSuppliers(suppliers.map(s => 
      s.id === selectedSupplier.id 
        ? { ...updatedData, id: s.id } 
        : s
    ));
    toast.success("Fornecedor atualizado com sucesso!");
    setDialogOpen(false);
    setSelectedSupplier(null);
  };

  const handleDeleteSupplier = () => {
    if (!selectedSupplier) return;
    
    setSuppliers(suppliers.filter(s => s.id !== selectedSupplier.id));
    toast.success("Fornecedor excluído com sucesso!");
    setDialogOpen(false);
    setSelectedSupplier(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="animate-fade-in">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <p className="text-label">Diretório</p>
            </div>
            <h1 className="text-heading text-foreground mb-2">
              Fornecedores Validados
            </h1>
            <p className="text-body-muted">
              Parceiros avaliados pela comunidade. Veja status e observações antes de comprar.
            </p>
          </div>

          {isAdmin && (
            <Button className="gap-2" onClick={handleOpenAddDialog}>
              <Plus className="h-4 w-4" />
              Adicionar Fornecedor
            </Button>
          )}
        </div>
      </header>

      <SupplierFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={dialogMode === "add" ? handleAddSupplier : handleUpdateSupplier}
        onDelete={dialogMode === "edit" ? handleDeleteSupplier : undefined}
        supplier={selectedSupplier}
        mode={dialogMode}
      />

      {/* Active Suppliers */}
      <section>
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-success" />
          Fornecedores Ativos
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {activeSuppliers.map((supplier, index) => (
            <SupplierCard 
              key={supplier.id} 
              supplier={supplier} 
              index={index}
              isAdmin={isAdmin}
              onEdit={() => handleEditSupplier(supplier)}
            />
          ))}
        </div>
      </section>

      {/* Other Suppliers */}
      {otherSuppliers.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">
            Outros Fornecedores
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {otherSuppliers.map((supplier, index) => (
              <SupplierCard 
                key={supplier.id} 
                supplier={supplier} 
                index={index + activeSuppliers.length}
                isAdmin={isAdmin}
                onEdit={() => handleEditSupplier(supplier)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Fornecedores;

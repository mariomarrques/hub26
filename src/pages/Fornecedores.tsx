import { useState } from "react";
import { Users, Star, Truck, CheckCircle, Pause, Sparkles, Plus, ExternalLink, Pencil, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SupplierFormDialog } from "@/components/suppliers/SupplierFormDialog";
import { useSuppliers, Supplier, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from "@/hooks/use-suppliers";

function RatingBar({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-xs font-medium text-foreground">{Number(value).toFixed(1)}</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(Number(value) / 5) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: typeof CheckCircle; label: string; className: string }> = {
    active: { icon: CheckCircle, label: "Confiável", className: "bg-success/15 text-success border-success/20" },
    paused: { icon: Pause, label: "Pausado", className: "bg-muted/50 text-muted-foreground border-muted" },
    new: { icon: Sparkles, label: "Novo", className: "bg-primary/15 text-primary border-primary/20" },
  };

  const { icon: Icon, label, className } = config[status] || config.new;

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
  canManage?: boolean;
  onEdit?: () => void;
}

function SupplierCard({ supplier, index, canManage, onEdit }: SupplierCardProps) {
  const avgRating = (Number(supplier.rating_quality) + Number(supplier.rating_delivery)) / 2;

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
        {supplier.categories?.map((cat) => (
          <span key={cat} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {cat}
          </span>
        ))}
      </div>

      {/* Ratings */}
      <div className="space-y-3 mb-4">
        <RatingBar label="Qualidade" value={supplier.rating_quality} icon={Star} />
        <RatingBar label="Prazo de Entrega" value={supplier.rating_delivery} icon={Truck} />
      </div>

      {/* Admin Note */}
      {supplier.admin_note && (
        <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground leading-relaxed">
          "{supplier.admin_note}"
        </p>
      )}

      {/* Footer Buttons */}
      <div className="mt-4 pt-3 border-t border-border flex gap-2">
        {supplier.link ? (
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 justify-center gap-2 text-muted-foreground hover:text-foreground"
            asChild
          >
            <a href={supplier.link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Ver detalhes
            </a>
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 justify-center gap-2 text-muted-foreground"
            disabled
          >
            <ExternalLink className="h-4 w-4" />
            Sem link
          </Button>
        )}
        {canManage && onEdit && (
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
  const { isAdmin, isModerator } = useAuth();
  const canManage = isAdmin || isModerator;
  const { data: suppliers, isLoading } = useSuppliers();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  
  const activeSuppliers = suppliers?.filter((s) => s.status === "active") || [];
  const otherSuppliers = suppliers?.filter((s) => s.status !== "active") || [];

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

  const handleAddSupplier = async (newSupplier: {
    name: string;
    status: string;
    categories: string[];
    rating: { quality: number; delivery: number };
    adminNote?: string;
    contact?: string;
    link?: string;
  }) => {
    await createSupplier.mutateAsync({
      name: newSupplier.name,
      status: newSupplier.status,
      categories: newSupplier.categories,
      rating_quality: newSupplier.rating.quality,
      rating_delivery: newSupplier.rating.delivery,
      admin_note: newSupplier.adminNote,
      contact: newSupplier.contact,
      link: newSupplier.link,
    });
    setDialogOpen(false);
  };

  const handleUpdateSupplier = async (updatedData: {
    name: string;
    status: string;
    categories: string[];
    rating: { quality: number; delivery: number };
    adminNote?: string;
    contact?: string;
    link?: string;
  }) => {
    if (!selectedSupplier) return;
    
    await updateSupplier.mutateAsync({
      id: selectedSupplier.id,
      name: updatedData.name,
      status: updatedData.status,
      categories: updatedData.categories,
      rating_quality: updatedData.rating.quality,
      rating_delivery: updatedData.rating.delivery,
      admin_note: updatedData.adminNote,
      contact: updatedData.contact,
      link: updatedData.link,
    });
    setDialogOpen(false);
    setSelectedSupplier(null);
  };

  const handleDeleteSupplier = async () => {
    if (!selectedSupplier) return;
    
    await deleteSupplier.mutateAsync(selectedSupplier.id);
    setDialogOpen(false);
    setSelectedSupplier(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Convert supplier for dialog
  const supplierForDialog = selectedSupplier ? {
    id: selectedSupplier.id,
    name: selectedSupplier.name,
    status: selectedSupplier.status as "active" | "paused" | "new",
    categories: selectedSupplier.categories || [],
    rating: {
      quality: Number(selectedSupplier.rating_quality),
      delivery: Number(selectedSupplier.rating_delivery),
      communication: Number(selectedSupplier.rating_communication),
    },
    adminNote: selectedSupplier.admin_note || undefined,
    contact: selectedSupplier.contact || undefined,
    link: selectedSupplier.link || undefined,
  } : null;

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

          {canManage && (
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
        supplier={supplierForDialog}
        mode={dialogMode}
      />

      {/* Active Suppliers */}
      {activeSuppliers.length > 0 && (
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
                canManage={canManage}
                onEdit={() => handleEditSupplier(supplier)}
              />
            ))}
          </div>
        </section>
      )}

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
                canManage={canManage}
                onEdit={() => handleEditSupplier(supplier)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {suppliers?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">
            Nenhum fornecedor cadastrado ainda.
          </p>
          {canManage && (
            <Button variant="outline" onClick={handleOpenAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar primeiro fornecedor
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Fornecedores;

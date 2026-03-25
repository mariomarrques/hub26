import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Home, Loader2, Plus, Search, Star } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useApprovedSuppliers, type SupplierListItem } from "@/hooks/use-suppliers";
import { AdminSupplierFormDialog } from "@/components/suppliers/AdminSupplierFormDialog";
import { SupplierDetailsDialog } from "@/components/suppliers/SupplierDetailsDialog";
import { SupplierReviewDialog } from "@/components/suppliers/SupplierReviewDialog";

interface SupplierCardProps {
  supplier: SupplierListItem;
  index: number;
  onOpenDetails: () => void;
  onOpenReview: () => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function SupplierCard({ supplier, index, onOpenDetails, onOpenReview }: SupplierCardProps) {
  return (
    <article
      className="animate-slide-up rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-200 ease-out hover:border-primary/30 hover:shadow-card-hover sm:p-6"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="mb-5 flex items-start gap-3.5">
        <Avatar className="h-12 w-12 border border-border">
          <AvatarImage src={supplier.avatar_url || undefined} alt={supplier.name} />
          <AvatarFallback>{getInitials(supplier.name)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 className="truncate text-base font-semibold leading-tight text-foreground sm:text-lg">
            {supplier.name}
          </h3>
          <p className="truncate text-xs text-muted-foreground">
            {supplier.country || "País não informado"}
          </p>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            <span className="font-medium text-foreground">{supplier.average_rating.toFixed(1)}</span>
            <span>({supplier.reviews_count} avaliações)</span>
          </div>
        </div>
      </div>

      <div className="mb-5 grid gap-2.5 sm:grid-cols-3">
        <div className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Método</p>
          <p className="mt-1 truncate text-sm font-medium text-foreground">
            {supplier.shipping_method || "Não informado"}
          </p>
        </div>
        <div className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Preparo</p>
          <p className="mt-1 truncate text-sm font-medium text-foreground">
            {supplier.prep_time || "Não informado"}
          </p>
        </div>
        <div className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Envio</p>
          <p className="mt-1 truncate text-sm font-medium text-foreground">
            {supplier.shipping_time || "Não informado"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 border-t border-border pt-4">
        <Button variant="outline" size="sm" className="h-9" onClick={onOpenDetails}>
          Detalhes
        </Button>
        <Button size="sm" className="h-9" onClick={onOpenReview}>
          Avaliar
        </Button>
      </div>
    </article>
  );
}

const Fornecedores = () => {
  const { isAdmin } = useAuth();
  const { data: suppliers = [], isLoading, isError, error, refetch } = useApprovedSuppliers();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [reviewSupplier, setReviewSupplier] = useState<SupplierListItem | null>(null);
  const [adminFormOpen, setAdminFormOpen] = useState(false);

  const filteredSuppliers = useMemo(() => {
    if (!searchQuery.trim()) return suppliers;

    const query = searchQuery.trim().toLowerCase();

    return suppliers.filter((supplier) => {
      const nameMatch = supplier.name.toLowerCase().includes(query);
      const countryMatch = supplier.country?.toLowerCase().includes(query);
      const shippingMatch = supplier.shipping_method?.toLowerCase().includes(query);
      return nameMatch || !!countryMatch || !!shippingMatch;
    });
  }, [suppliers, searchQuery]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 sm:space-y-10">
      <Breadcrumb className="animate-fade-in">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Fornecedores</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="animate-fade-in flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2.5">
          <h1 className="text-heading text-foreground">Fornecedores</h1>
          <p className="text-body-muted">Consulte fornecedores aprovados e avaliações da comunidade.</p>
        </div>

        {isAdmin && (
          <Button onClick={() => setAdminFormOpen(true)} className="h-10 w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Cadastrar fornecedor
          </Button>
        )}
      </header>

      <div className="animate-fade-in">
        <div className="relative max-w-xl">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Buscar fornecedores..."
            className="h-11 rounded-xl border-border/80 bg-card pl-11 pr-4"
          />
        </div>
      </div>

      {isLoading && (
        <div className="animate-fade-in rounded-2xl border border-border bg-card px-6 py-12 text-center text-muted-foreground">
          <div className="flex min-h-[140px] flex-col items-center justify-center">
            <Loader2 className="mb-3 h-5 w-5 animate-spin" />
            <p className="text-sm">Carregando fornecedores...</p>
          </div>
        </div>
      )}

      {isError && (
        <div className="animate-fade-in rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10">
          <div className="flex min-h-[140px] flex-col items-center justify-center text-center">
            <p className="mb-2 text-sm text-destructive">Não foi possível carregar os fornecedores.</p>
            {import.meta.env.DEV && error instanceof Error && (
              <p className="mb-3 max-w-xl text-xs text-destructive/80">{error.message}</p>
            )}
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </div>
        </div>
      )}

      {!isLoading && !isError && suppliers.length === 0 && (
        <div className="animate-fade-in rounded-2xl border border-border bg-card px-6 py-12 text-center text-muted-foreground">
          <div className="flex min-h-[140px] items-center justify-center">
            Nenhum fornecedor aprovado disponível no momento.
          </div>
        </div>
      )}

      {!isLoading && !isError && suppliers.length > 0 && filteredSuppliers.length === 0 && (
        <div className="animate-fade-in rounded-2xl border border-border bg-card px-6 py-12 text-center text-muted-foreground">
          <div className="flex min-h-[140px] items-center justify-center">
            Nenhum fornecedor encontrado para sua busca.
          </div>
        </div>
      )}

      {!isLoading && !isError && filteredSuppliers.length > 0 && (
        <section className="animate-fade-in grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSuppliers.map((supplier, index) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              index={index}
              onOpenDetails={() => setSelectedSupplierId(supplier.id)}
              onOpenReview={() => setReviewSupplier(supplier)}
            />
          ))}
        </section>
      )}

      <SupplierDetailsDialog
        open={!!selectedSupplierId}
        onOpenChange={(open) => {
          if (!open) setSelectedSupplierId(null);
        }}
        supplierId={selectedSupplierId}
      />

      <SupplierReviewDialog
        open={!!reviewSupplier}
        onOpenChange={(open) => {
          if (!open) setReviewSupplier(null);
        }}
        supplier={reviewSupplier}
      />

      {isAdmin && (
        <AdminSupplierFormDialog
          open={adminFormOpen}
          onOpenChange={setAdminFormOpen}
        />
      )}
    </div>
  );
};

export default Fornecedores;

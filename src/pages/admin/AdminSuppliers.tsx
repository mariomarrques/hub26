import { useMemo, useState } from "react";
import { Check, Loader2, Pencil, Plus, Store, X } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AdminSupplierFormDialog,
  type EditableSupplier,
} from "@/components/suppliers/AdminSupplierFormDialog";
import {
  type AdminSupplierListItem,
  useAdminSuppliers,
  useUpdateSupplierStatus,
} from "@/hooks/use-suppliers";
import { formatRelativeTime } from "@/lib/date-utils";

const statusLabel: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

function toEditableSupplier(supplier: AdminSupplierListItem): EditableSupplier {
  return {
    id: supplier.id,
    name: supplier.name,
    avatar_url: supplier.avatar_url,
    country: supplier.country,
    shipping_method: supplier.shipping_method,
    prep_time: supplier.prep_time,
    shipping_time: supplier.shipping_time,
    description: supplier.description,
    whatsapp_link: supplier.whatsapp_link,
    group_link: supplier.group_link,
    links: supplier.links,
    status: supplier.status,
  };
}

export default function AdminSuppliers() {
  const { data: suppliers = [], isLoading, isError, error, refetch } = useAdminSuppliers();
  const updateStatus = useUpdateSupplierStatus();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<EditableSupplier | null>(null);

  const sortedSuppliers = useMemo(() => suppliers, [suppliers]);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Fornecedores</h2>
            <p className="text-sm text-muted-foreground">
              Gerencie cadastro e status dos fornecedores.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Cadastrar fornecedor
          </Button>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">País</TableHead>
                <TableHead className="hidden lg:table-cell">Método de envio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Criado</TableHead>
                <TableHead className="w-[280px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="inline-flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Carregando fornecedores...
                    </div>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="space-y-2">
                      <p className="text-sm text-destructive">Não foi possível carregar os fornecedores.</p>
                      {import.meta.env.DEV && error instanceof Error && (
                        <p className="mx-auto max-w-xl text-xs text-destructive/80">{error.message}</p>
                      )}
                      <Button variant="outline" size="sm" onClick={() => refetch()}>
                        Tentar novamente
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : sortedSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    <div className="inline-flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      Nenhum fornecedor cadastrado.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {supplier.country || "Não informado"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {supplier.shipping_method || "Não informado"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[supplier.status] || "outline"}>
                        {statusLabel[supplier.status] || supplier.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {formatRelativeTime(supplier.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9"
                          onClick={() => setEditingSupplier(toEditableSupplier(supplier))}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Button>

                        <Button
                          size="sm"
                          className="h-9"
                          onClick={() => updateStatus.mutate({ id: supplier.id, status: "approved" })}
                          disabled={updateStatus.isPending || supplier.status === "approved"}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Aprovar
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-9"
                          onClick={() => updateStatus.mutate({ id: supplier.id, status: "rejected" })}
                          disabled={updateStatus.isPending || supplier.status === "rejected"}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Rejeitar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AdminSupplierFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <AdminSupplierFormDialog
        open={!!editingSupplier}
        onOpenChange={(open) => {
          if (!open) setEditingSupplier(null);
        }}
        supplier={editingSupplier}
        onSuccess={() => setEditingSupplier(null)}
      />
    </AdminLayout>
  );
}

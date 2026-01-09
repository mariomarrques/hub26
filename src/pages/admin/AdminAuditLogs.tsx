import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, History } from "lucide-react";
import { useAuditLogs, type AuditAction } from "@/hooks/use-audit-logs";
import { AuditLogItem } from "@/components/admin/AuditLogItem";

const ITEMS_PER_PAGE = 20;

const actionOptions: { value: AuditAction | "all"; label: string }[] = [
  { value: "all", label: "Todas as ações" },
  { value: "role_change", label: "Alterações de Role" },
  { value: "bulk_notification", label: "Notificações em Massa" },
  { value: "user_delete", label: "Exclusões de Usuário" },
  { value: "settings_change", label: "Alterações de Config" },
];

export default function AdminAuditLogs() {
  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState<AuditAction | "all">("all");
  
  const { data: logs, isLoading } = useAuditLogs({
    limit: ITEMS_PER_PAGE,
    offset: page * ITEMS_PER_PAGE,
    action: actionFilter === "all" ? null : actionFilter,
  });

  const hasNextPage = logs?.length === ITEMS_PER_PAGE;
  const hasPrevPage = page > 0;

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Logs de Auditoria
              </CardTitle>
              <CardDescription>
                Histórico de ações administrativas
              </CardDescription>
            </div>
            
            <Select 
              value={actionFilter} 
              onValueChange={(v) => {
                setActionFilter(v as AuditAction | "all");
                setPage(0);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por ação" />
              </SelectTrigger>
              <SelectContent>
                {actionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                </div>
              ))}
            </div>
          ) : logs && logs.length > 0 ? (
            <div>
              {logs.map((log) => (
                <AuditLogItem key={log.id} log={log} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum log encontrado</p>
            </div>
          )}
          
          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={!hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            
            <span className="text-sm text-muted-foreground">
              Página {page + 1}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNextPage}
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}

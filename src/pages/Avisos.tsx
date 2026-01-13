import { Link } from "react-router-dom";
import { Bell, Filter, Check, Home, Trash2, BellOff, Sparkles } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/contexts/NotificationContext";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const filterOptions: { value: string; label: string; icon?: string }[] = [
  { value: "all", label: "Todos" },
  { value: "mention", label: "Menções" },
  { value: "product", label: "Produtos" },
  { value: "alert", label: "Alertas" },
  { value: "community", label: "Comunidade" },
  { value: "announcement", label: "Anúncios" },
];

const Avisos = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    deleteAllNotifications 
  } = useNotifications();

  const filteredNotifications = notifications.filter((notification) => {
    if (activeFilter === "all") return true;
    return notification.type === activeFilter;
  });

  // Contagem por tipo para os filtros
  const typeCounts = notifications.reduce((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
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
            <BreadcrumbPage>Avisos</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Card */}
      <header className="animate-fade-in rounded-xl border border-border bg-gradient-to-br from-card to-card/50 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Central de Notificações
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {notifications.length === 0 
                  ? "Nenhuma notificação ainda"
                  : unreadCount > 0 
                    ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''} de ${notifications.length} total`
                    : `${notifications.length} notificação${notifications.length > 1 ? 'ões' : ''} - todas lidas`
                }
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={markAllAsRead}
                className="gap-1.5 h-9"
              >
                <Check className="h-4 w-4" />
                <span className="hidden sm:inline">Marcar todas como lidas</span>
                <span className="sm:hidden">Marcar lidas</span>
              </Button>
            )}
            
            {notifications.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="gap-1.5 h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Limpar todas</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Limpar todas as notificações?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Todas as {notifications.length} notificações serão permanentemente removidas.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={deleteAllNotifications}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Limpar todas
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </header>

      {/* Filters */}
      {notifications.length > 0 && (
        <section className="animate-slide-up" style={{ animationDelay: "50ms" }}>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
              <Filter className="h-3.5 w-3.5" />
              <span className="font-medium">Filtrar:</span>
            </div>
            {filterOptions.map((option) => {
              const count = option.value === "all" 
                ? notifications.length 
                : typeCounts[option.value] || 0;
              
              if (option.value !== "all" && count === 0) return null;
              
              return (
                <button
                  key={option.value}
                  onClick={() => setActiveFilter(option.value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150",
                    "flex items-center gap-1.5",
                    activeFilter === option.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
                  )}
                >
                  {option.label}
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
                    activeFilter === option.value
                      ? "bg-primary/20"
                      : "bg-muted"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Notifications List */}
      <section className="animate-slide-up" style={{ animationDelay: "100ms" }}>
        {isLoading ? (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 p-4 border-b border-border last:border-b-0">
                <Skeleton className="h-11 w-11 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
            {filteredNotifications.map((notification, index) => (
              <div 
                key={notification.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <NotificationItem
                  notification={notification}
                  onRead={markAsRead}
                  showLinkButton
                  onDelete={deleteNotification}
                />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          /* Empty State - Sem nenhuma notificação */
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted">
                <BellOff className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhuma notificação
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Quando você receber menções, alertas de produtos ou atualizações da comunidade, elas aparecerão aqui.
            </p>
          </div>
        ) : (
          /* Empty State - Filtro sem resultados */
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
            <div className="flex justify-center mb-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted">
                <Filter className="h-5 w-5 text-muted-foreground/50" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Nenhuma notificação encontrada com o filtro "{filterOptions.find(f => f.value === activeFilter)?.label}".
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveFilter("all")}
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              Ver todas
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Avisos;

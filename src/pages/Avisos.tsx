import { Bell, Filter, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/contexts/NotificationContext";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const filterOptions: { value: string; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "mention", label: "Menções" },
  { value: "product", label: "Produtos" },
  { value: "alert", label: "Alertas" },
  { value: "community", label: "Comunidade" },
  { value: "announcement", label: "Anúncios" },
];

const Avisos = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();

  const filteredNotifications = notifications.filter((notification) => {
    if (activeFilter === "all") return true;
    return notification.type === activeFilter;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="h-5 w-5 text-primary" />
          <p className="text-label">Central de Notificações</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading text-foreground mb-2">
              Suas Notificações
            </h1>
            <p className="text-body-muted">
              {unreadCount > 0 
                ? `Você tem ${unreadCount} notificação${unreadCount > 1 ? 'ões' : ''} não lida${unreadCount > 1 ? 's' : ''}.`
                : "Você está em dia com todas as notificações."}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={markAllAsRead}
              className="gap-1.5"
            >
              <Check className="h-4 w-4" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
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
              key={option.value}
              onClick={() => setActiveFilter(option.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150",
                activeFilter === option.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {/* Notifications List */}
      <section className="space-y-2">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3 p-4 border border-border rounded-lg bg-card">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification, index) => (
            <div 
              key={notification.id} 
              className="animate-slide-up border border-border rounded-lg bg-card"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <NotificationItem
                notification={notification}
                onRead={markAsRead}
              />
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-muted-foreground">Nenhuma notificação encontrada com esse filtro.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Avisos;

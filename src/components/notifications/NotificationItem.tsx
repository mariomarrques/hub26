import { AtSign, Package, AlertTriangle, MessageSquare, Megaphone, ExternalLink, Trash2, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Notification, NotificationType } from "@/types/notification";
import { formatRelativeTime } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";
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

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  compact?: boolean;
  showLinkButton?: boolean;
  onDelete?: (id: string) => void;
}

const typeConfig: Record<NotificationType, { 
  icon: typeof AtSign; 
  bgColor: string;
  iconColor: string;
  label: string;
}> = {
  product: {
    icon: Package,
    bgColor: "bg-emerald-500/15",
    iconColor: "text-emerald-500",
    label: "Novo Produto",
  },
  community: {
    icon: MessageSquare,
    bgColor: "bg-violet-500/15",
    iconColor: "text-violet-500",
    label: "Comunidade",
  },
  mention: {
    icon: AtSign,
    bgColor: "bg-blue-500/15",
    iconColor: "text-blue-500",
    label: "Menção",
  },
  announcement: {
    icon: Megaphone,
    bgColor: "bg-amber-500/15",
    iconColor: "text-amber-500",
    label: "Anúncio",
  },
  alert: {
    icon: AlertTriangle,
    bgColor: "bg-red-500/15",
    iconColor: "text-red-500",
    label: "Alerta",
  },
  post_approved: {
    icon: CheckCircle,
    bgColor: "bg-green-500/15",
    iconColor: "text-green-500",
    label: "Aprovado",
  },
  post_rejected: {
    icon: XCircle,
    bgColor: "bg-destructive/15",
    iconColor: "text-destructive",
    label: "Rejeitado",
  },
};

export function NotificationItem({ 
  notification, 
  onRead, 
  compact = false, 
  showLinkButton = false, 
  onDelete 
}: NotificationItemProps) {
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  const handleClick = () => {
    if (!notification.is_read) {
      onRead(notification.id);
    }
    
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  return (
    <div
      className={cn(
        "group relative flex items-start gap-4 p-4 transition-all duration-200",
        !notification.is_read && "bg-primary/5",
        "hover:bg-muted/50"
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      {/* Indicador de não lida */}
      {!notification.is_read && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg" />
      )}

      {/* Ícone com fundo colorido */}
      <div className={cn(
        "flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl",
        config.bgColor
      )}>
        <Icon className={cn("h-5 w-5", config.iconColor)} />
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Header: Label + Tempo */}
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-[11px] font-semibold uppercase tracking-wide",
            config.iconColor
          )}>
            {config.label}
          </span>
          <span className="text-[11px] text-muted-foreground">
            • {formatRelativeTime(notification.created_at)}
          </span>
        </div>

        {/* Título */}
        <p className={cn(
          "text-sm font-medium text-foreground leading-snug",
          compact && "line-clamp-1"
        )}>
          {notification.title}
        </p>

        {/* Mensagem */}
        <p className={cn(
          "text-sm text-muted-foreground leading-relaxed",
          compact ? "line-clamp-1" : "line-clamp-2"
        )}>
          {notification.message}
        </p>

        {/* Link Button */}
        {showLinkButton && notification.link && (
          <a
            href={notification.link}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline mt-2"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver detalhes
          </a>
        )}
      </div>

      {/* Botão de Delete com confirmação */}
      {onDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "flex-shrink-0 h-9 w-9 rounded-lg",
                "text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10",
                "opacity-0 group-hover:opacity-100 transition-opacity"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover notificação?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. A notificação será permanentemente removida.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

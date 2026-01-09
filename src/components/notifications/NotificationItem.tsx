import { AtSign, Package, AlertTriangle, MessageSquare, Megaphone, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Notification, NotificationType } from "@/types/notification";
import { formatRelativeTime } from "@/lib/date-utils";

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  compact?: boolean;
  showLinkButton?: boolean;
}

const typeConfig: Record<NotificationType, { icon: typeof AtSign; className: string }> = {
  mention: {
    icon: AtSign,
    className: "text-blue-500 bg-blue-500/10",
  },
  product: {
    icon: Package,
    className: "text-success bg-success/10",
  },
  alert: {
    icon: AlertTriangle,
    className: "text-hot bg-hot/10",
  },
  community: {
    icon: MessageSquare,
    className: "text-purple-500 bg-purple-500/10",
  },
  announcement: {
    icon: Megaphone,
    className: "text-primary bg-primary/10",
  },
};

export function NotificationItem({ notification, onRead, compact = false, showLinkButton = false }: NotificationItemProps) {
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  const handleClick = () => {
    if (!notification.is_read) {
      onRead(notification.id);
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 p-3 rounded-lg transition-colors cursor-pointer",
        !notification.is_read && "bg-accent/50",
        "hover:bg-accent"
      )}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className={cn("flex-shrink-0 p-2 rounded-full", config.className)}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <p className={cn(
            "text-sm font-medium text-foreground",
            compact && "line-clamp-1"
          )}>
            {notification.title}
          </p>
          {!notification.is_read && (
            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" />
          )}
        </div>
        <p className={cn(
          "text-sm text-muted-foreground mt-0.5",
          compact ? "line-clamp-1" : "line-clamp-2"
        )}>
          {notification.message}
        </p>
        <span className="text-xs text-muted-foreground mt-1 block">
          {formatRelativeTime(notification.created_at)}
        </span>

        {/* Link Button - only shown on full page */}
        {showLinkButton && notification.link && (
          <div className="mt-2 pt-2 border-t border-border">
            <a
              href={notification.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
              Abrir link
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

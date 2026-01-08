import { AlertTriangle, Info, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertType = "urgent" | "info" | "success" | "warning";

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  timestamp: string;
  isNew?: boolean;
}

interface AlertCardProps {
  alert: Alert;
  index?: number;
}

const alertConfig = {
  urgent: {
    icon: AlertTriangle,
    className: "border-hot/30 bg-hot/5",
    iconClass: "text-hot",
  },
  info: {
    icon: Info,
    className: "border-primary/30 bg-primary/5",
    iconClass: "text-primary",
  },
  success: {
    icon: CheckCircle,
    className: "border-success/30 bg-success/5",
    iconClass: "text-success",
  },
  warning: {
    icon: Clock,
    className: "border-warning/30 bg-warning/5",
    iconClass: "text-warning",
  },
};

export function AlertCard({ alert, index = 0 }: AlertCardProps) {
  const config = alertConfig[alert.type];
  const Icon = config.icon;

  return (
    <article
      className={cn(
        "relative rounded-xl border p-4 transition-all duration-200 ease-out hover:shadow-card animate-slide-up",
        config.className
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {alert.isNew && (
        <span className="absolute -top-1.5 right-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
          Novo
        </span>
      )}

      <div className="flex gap-3">
        <div className={cn("mt-0.5 flex-shrink-0", config.iconClass)}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground mb-1">{alert.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{alert.message}</p>
          <span className="mt-2 inline-block text-xs text-muted-foreground/70">
            {alert.timestamp}
          </span>
        </div>
      </div>
    </article>
  );
}

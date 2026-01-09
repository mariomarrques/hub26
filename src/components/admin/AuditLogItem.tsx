import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserCog, Bell, Trash2, Settings } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { AuditLog, AuditAction } from "@/hooks/use-audit-logs";

interface AuditLogItemProps {
  log: AuditLog;
}

const actionConfig: Record<AuditAction, { 
  label: string; 
  icon: typeof UserCog; 
  variant: "default" | "secondary" | "destructive" | "outline" 
}> = {
  role_change: { label: "Alteração de Role", icon: UserCog, variant: "default" },
  bulk_notification: { label: "Notificação em Massa", icon: Bell, variant: "secondary" },
  user_delete: { label: "Exclusão de Usuário", icon: Trash2, variant: "destructive" },
  settings_change: { label: "Alteração de Config", icon: Settings, variant: "outline" },
};

export function AuditLogItem({ log }: AuditLogItemProps) {
  const config = actionConfig[log.action];
  const Icon = config.icon;
  
  const formatDetails = () => {
    const details = log.details;
    
    if (log.action === "role_change") {
      return (
        <span>
          {log.target_user_name || "Usuário"}: {" "}
          <span className="text-muted-foreground">{String(details.old_role)}</span>
          {" → "}
          <span className="font-medium text-foreground">{String(details.new_role)}</span>
        </span>
      );
    }
    
    if (log.action === "bulk_notification") {
      return (
        <span>
          {String(details.recipients_count)} destinatários - "{String(details.title)}"
        </span>
      );
    }
    
    return JSON.stringify(details);
  };

  return (
    <div className="flex items-start gap-4 p-4 border-b border-border last:border-0">
      <Avatar className="h-9 w-9">
        <AvatarFallback className="bg-primary/10 text-primary text-sm">
          {log.admin_name?.charAt(0).toUpperCase() || "A"}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-foreground">
            {log.admin_name || "Admin"}
          </span>
          <Badge variant={config.variant} className="gap-1">
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground mt-1">
          {formatDetails()}
        </p>
        
        <p className="text-xs text-muted-foreground mt-2">
          {formatDistanceToNow(new Date(log.created_at), { 
            addSuffix: true, 
            locale: ptBR 
          })}
        </p>
      </div>
    </div>
  );
}

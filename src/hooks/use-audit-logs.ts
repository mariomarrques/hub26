import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AuditAction = 
  | "role_change" 
  | "bulk_notification" 
  | "user_delete" 
  | "settings_change";

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_name: string | null;
  action: AuditAction;
  target_user_id: string | null;
  target_user_name: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

interface UseAuditLogsParams {
  limit?: number;
  offset?: number;
  action?: AuditAction | null;
  adminId?: string | null;
}

export function useAuditLogs(params?: UseAuditLogsParams) {
  return useQuery({
    queryKey: ["admin", "audit-logs", params],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_audit_logs", {
        p_limit: params?.limit || 50,
        p_offset: params?.offset || 0,
        p_action: params?.action || null,
        p_admin_id: params?.adminId || null
      });
      
      if (error) throw error;
      return (data || []) as AuditLog[];
    }
  });
}

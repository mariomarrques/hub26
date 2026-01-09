import { AdminLayout } from "@/components/admin/AdminLayout";
import { BulkNotificationForm } from "@/components/admin/BulkNotificationForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminStats, useSendBulkNotification, BulkNotificationParams } from "@/hooks/use-admin";

export default function AdminNotifications() {
  const { data: stats } = useAdminStats();
  const sendNotification = useSendBulkNotification();

  const userCounts = stats
    ? {
        admin: stats.admin_count,
        moderator: stats.moderator_count,
        member: stats.member_count,
        total: stats.total_users,
      }
    : undefined;

  const handleSubmit = (params: BulkNotificationParams) => {
    sendNotification.mutate(params);
  };

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Enviar Notificação em Massa</CardTitle>
        </CardHeader>
        <CardContent>
          <BulkNotificationForm
            onSubmit={handleSubmit}
            isLoading={sendNotification.isPending}
            userCounts={userCounts}
          />
        </CardContent>
      </Card>
    </AdminLayout>
  );
}

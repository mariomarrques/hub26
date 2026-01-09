export type NotificationType = 
  | "mention" 
  | "product" 
  | "alert" 
  | "community" 
  | "announcement";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  link?: string | null;
  sender_id?: string | null;
  created_at: string;
}

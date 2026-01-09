export type NotificationType = 
  | "mention" 
  | "product" 
  | "alert" 
  | "community" 
  | "announcement";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
  senderId?: string;
}

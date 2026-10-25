import { apiClient } from "@/lib/apiClient";
import {
  parseNotification,
  parseNotificationsResponse,
} from "@/lib/notifications/parse";
import type {
  NotificationDTO,
  NotificationsResponseDTO,
} from "@/types/notification.types";

export async function getNotifications() {
  const res = await apiClient.get<NotificationsResponseDTO>("/notifications/");
  return parseNotificationsResponse(res.data);
}

export async function markNotificationRead(id: number) {
  const res = await apiClient.post<NotificationDTO>(`/notifications/${id}/read/`);
  return parseNotification(res.data);
}

export async function markAllNotificationsRead() {
  const res = await apiClient.post<{ updated: number }>("/notifications/read-all/");
  return res.data;
}

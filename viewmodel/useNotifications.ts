import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { toast } from "sonner-native";
import { queryClient } from "@/lib/queryClient";
import { extractErrorMessage } from "@/lib/apiClient";
import {
  insertNotification,
  markAllRead,
  markRead,
  notificationsQueryKey,
  optimistic,
} from "@/lib/notifications/cache";
import { ctaHref, ctaLabel } from "@/lib/notifications/cta";
import { parseNotification } from "@/lib/notifications/parse";
import { useAuthStore } from "@/repositories/useAuthStore";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notificationService";
import type {
  AppNotification,
  NotificationDTO,
  NotificationsState,
} from "@/types/notification.types";

export function refetchNotifications() {
  return queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
}

async function updateOptimistically(
  update: (state: NotificationsState | undefined) => NotificationsState | undefined,
  request: () => Promise<unknown>,
  errorMessage: string,
) {
  await queryClient.cancelQueries({ queryKey: notificationsQueryKey });
  const rollback = optimistic(queryClient, notificationsQueryKey, update);
  try {
    await request();
  } catch (error) {
    rollback();
    toast.error(extractErrorMessage(error, errorMessage));
  }
}

export function readNotification(notification: AppNotification) {
  if (notification.readAt) return;
  return updateOptimistically(
    (s) => markRead(s, notification.id, new Date().toISOString()),
    () => markNotificationRead(notification.id),
    "Couldn't mark this notification as read",
  );
}

export function readAllNotifications() {
  return updateOptimistically(
    (s) => markAllRead(s, new Date().toISOString()),
    markAllNotificationsRead,
    "Couldn't mark your notifications as read",
  );
}

export function openNotificationCta(notification: AppNotification) {
  if (!notification.cta) return;
  readNotification(notification);
  router.push(ctaHref(notification.cta, useAuthStore.getState().user?.role ?? "PATIENT"));
}

export function receiveNotification(data: unknown) {
  const dto = data as Partial<NotificationDTO> | null;
  if (typeof dto?.id !== "number" || typeof dto.title !== "string") return;
  const notification = parseNotification(dto as NotificationDTO);

  queryClient.setQueryData<NotificationsState>(notificationsQueryKey, (s) =>
    insertNotification(s, notification),
  );
  toast(notification.title, {
    action: notification.cta
      ? {
          label: ctaLabel(notification.cta),
          onClick: () => openNotificationCta(notification),
        }
      : undefined,
  });
}

export function useNotifications() {
  const { data, isLoading } = useQuery({
    queryKey: notificationsQueryKey,
    queryFn: getNotifications,
  });
  const notifications = data?.results ?? [];

  return {
    notifications,
    unreadCount: data?.unreadCount ?? 0,
    newestUnreadUrgent:
      notifications.find((n) => !n.readAt && n.severity === "URGENT") ?? null,
    isLoading,
    readNotification,
    readAllNotifications,
    openNotificationCta,
  };
}

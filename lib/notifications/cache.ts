import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type {
  AppNotification,
  NotificationsState,
} from "../../types/notification.types";

export const notificationsQueryKey = ["/notifications/"] as const;

export function insertNotification(
  state: NotificationsState | undefined,
  notification: AppNotification,
): NotificationsState {
  const current = state ?? { unreadCount: 0, results: [] };
  if (current.results.some((n) => n.id === notification.id)) return current;
  return {
    unreadCount: current.unreadCount + (notification.readAt ? 0 : 1),
    results: [notification, ...current.results],
  };
}

export function markRead(
  state: NotificationsState | undefined,
  id: number,
  readAt: string,
): NotificationsState | undefined {
  const target = state?.results.find((n) => n.id === id);
  if (!state || !target || target.readAt) return state;
  return {
    unreadCount: Math.max(0, state.unreadCount - 1),
    results: state.results.map((n) => (n.id === id ? { ...n, readAt } : n)),
  };
}

export function markAllRead(
  state: NotificationsState | undefined,
  readAt: string,
): NotificationsState | undefined {
  if (!state) return state;
  return {
    unreadCount: 0,
    results: state.results.map((n) => (n.readAt ? n : { ...n, readAt })),
  };
}

export function optimistic<T>(
  queryClient: QueryClient,
  key: QueryKey,
  update: (state: T | undefined) => T | undefined,
): () => void {
  const snapshot = queryClient.getQueryData<T>(key);
  queryClient.setQueryData<T>(key, update);
  return () => queryClient.setQueryData<T>(key, snapshot);
}

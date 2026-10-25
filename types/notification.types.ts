import type { Concern } from "./appointment.types";

export type Severity = "INFO" | "WARNING" | "URGENT";

export type NotificationCta =
  | { kind: "BOOK_CONSULTATION"; concern: Concern }
  | { kind: "OPEN_APPOINTMENT"; appointmentId: number };

// Wire shape. kind/severity/action stay open strings because the backend
// will add new values before the app knows about them.
export interface NotificationDTO {
  id: number;
  kind: string;
  severity: string;
  title: string;
  body: string;
  action: string;
  action_payload: { concern?: string; appointment_id?: unknown } | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationsResponseDTO {
  unread_count: number;
  results: NotificationDTO[];
}

export interface AppNotification {
  id: number;
  kind: string;
  severity: Severity | null;
  title: string;
  body: string;
  cta: NotificationCta | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsState {
  unreadCount: number;
  results: AppNotification[];
}

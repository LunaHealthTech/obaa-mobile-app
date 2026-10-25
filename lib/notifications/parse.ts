import type {
  AppNotification,
  NotificationCta,
  NotificationDTO,
  NotificationsResponseDTO,
  NotificationsState,
  Severity,
} from "../../types/notification.types";
import { parseConcern } from "../appointments/concerns.ts";

const SEVERITIES: readonly Severity[] = ["INFO", "WARNING", "URGENT"];

function parseSeverity(value: string): Severity | null {
  return (SEVERITIES as readonly string[]).includes(value)
    ? (value as Severity)
    : null;
}

function parseCta(dto: NotificationDTO): NotificationCta | null {
  const payload = dto.action_payload;
  switch (dto.action) {
    case "BOOK_CONSULTATION": {
      const concern = parseConcern(payload?.concern);
      return concern ? { kind: "BOOK_CONSULTATION", concern } : null;
    }
    case "OPEN_APPOINTMENT": {
      const id = payload?.appointment_id;
      return typeof id === "number" && Number.isInteger(id)
        ? { kind: "OPEN_APPOINTMENT", appointmentId: id }
        : null;
    }
    default:
      return null;
  }
}

export function parseNotification(dto: NotificationDTO): AppNotification {
  return {
    id: dto.id,
    kind: dto.kind,
    severity: parseSeverity(dto.severity),
    title: dto.title,
    body: dto.body,
    cta: parseCta(dto),
    readAt: dto.read_at,
    createdAt: dto.created_at,
  };
}

export function parseNotificationsResponse(
  dto: NotificationsResponseDTO,
): NotificationsState {
  return {
    unreadCount: dto.unread_count,
    results: dto.results.map(parseNotification),
  };
}

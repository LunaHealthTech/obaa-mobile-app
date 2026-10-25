import type { NotificationCta } from "../../types/notification.types";
import type { Role } from "../../types/call.types";

export function ctaHref(cta: NotificationCta, role: Role) {
  switch (cta.kind) {
    case "BOOK_CONSULTATION":
      return {
        pathname: "/consult/match-preferences",
        params: { concern: cta.concern },
      } as const;
    case "OPEN_APPOINTMENT":
      return {
        pathname: role === "MIDWIFE" ? "/midwife/appointment" : "/consult/appointment",
        params: { appointmentId: String(cta.appointmentId) },
      } as const;
  }
}

export function ctaLabel(cta: NotificationCta): string {
  switch (cta.kind) {
    case "BOOK_CONSULTATION":
      return "Book a consultation";
    case "OPEN_APPOINTMENT":
      return "View appointment";
  }
}

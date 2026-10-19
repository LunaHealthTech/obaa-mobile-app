import type {
  Appointment,
  AppointmentStatus,
} from "../../types/appointment.types";
import type { Role } from "../../types/call.types";

type Screen = "finding-midwife" | "midwife-match" | "appointment";

export type StatusTone = "active" | "pending" | "done" | "ended" | "alert";

type StatusInfo = { chip: string; screen: Screen; tone: StatusTone };

export const appointmentStatus: Record<AppointmentStatus, StatusInfo> = {
  PENDING_MATCH: { chip: "Finding midwife", screen: "finding-midwife", tone: "pending" },
  MATCHED: { chip: "Awaiting payment", screen: "midwife-match", tone: "pending" },
  CONFIRMED: { chip: "Confirmed", screen: "appointment", tone: "active" },
  COMPLETED: { chip: "Completed", screen: "appointment", tone: "done" },
  CANCELLED: { chip: "Cancelled", screen: "appointment", tone: "ended" },
  EXPIRED: { chip: "Expired", screen: "appointment", tone: "ended" },
  MIDWIFE_NO_SHOW: { chip: "Missed by midwife", screen: "appointment", tone: "alert" },
  PATIENT_NO_SHOW: { chip: "Missed by patient", screen: "appointment", tone: "ended" },
  REFUNDED: { chip: "Refunded", screen: "appointment", tone: "ended" },
};

// The backend adds statuses before the app ships support for them; an
// unknown one shows the server's label instead of crashing the screen.
export function statusInfo(status: string, label?: string): StatusInfo {
  return (
    appointmentStatus[status as AppointmentStatus] ?? {
      chip: label || status,
      screen: "appointment",
      tone: "ended",
    }
  );
}

export function canRebookFree(appointment: Pick<Appointment, "status">, role: Role) {
  return role === "PATIENT" && appointment.status === "MIDWIFE_NO_SHOW";
}

const money = (currency: string, amount: number) => `${currency} ${amount.toFixed(2)}`;

// What the patient reads on an appointment that is over.
export function closedStatusMessage(
  appointment: Pick<Appointment, "status" | "status_label" | "fee" | "refund">,
): string {
  const { refund, fee } = appointment;
  switch (appointment.status) {
    case "PATIENT_NO_SHOW": {
      if (!refund) return "You didn't join this consultation. Your partial refund is on its way.";
      const kept = Number(fee.amount) - Number(refund.amount);
      return `You didn't join this consultation. ${money(refund.currency, Number(refund.amount))} was refunded and ${money(fee.currency, kept)} was kept as the missed-session fee.`;
    }
    case "REFUNDED":
      return refund
        ? `Your midwife missed this consultation. ${money(refund.currency, Number(refund.amount))} was refunded in full.`
        : "Your midwife missed this consultation. It was refunded in full.";
    default:
      return `Status: ${statusInfo(appointment.status, appointment.status_label).chip}`;
  }
}

export function holdSecondsLeft(
  appointment: Pick<Appointment, "status" | "hold_expires_at">,
  now: Date,
): number {
  if (appointment.status !== "MATCHED" || !appointment.hold_expires_at) return 0;
  const ms = new Date(appointment.hold_expires_at).getTime() - now.getTime();
  return Math.max(0, Math.floor(ms / 1000));
}

export function routeForAppointment(
  appointment: Pick<Appointment, "id" | "status" | "hold_expires_at">,
  now: Date,
) {
  const screen =
    appointment.status === "MATCHED" && holdSecondsLeft(appointment, now) === 0
      ? "appointment"
      : statusInfo(appointment.status).screen;
  return {
    pathname: `/consult/${screen}`,
    params: { appointmentId: String(appointment.id) },
  } as const;
}

export function canCancel(
  appointment: Pick<Appointment, "status" | "scheduled_start">,
  now: Date,
): boolean {
  return (
    (appointment.status === "MATCHED" || appointment.status === "CONFIRMED") &&
    new Date(appointment.scheduled_start).getTime() > now.getTime()
  );
}

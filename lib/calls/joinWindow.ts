import type { Appointment } from "../../types/appointment.types";

export type JoinState =
  | { kind: "hidden" }
  | { kind: "locked"; secondsUntilOpen: number }
  | { kind: "open" }
  | { kind: "closed" };

type CallFields = Pick<
  Appointment,
  "status" | "consultation_type" | "call_opens_at" | "scheduled_end"
>;

export function joinState(appointment: CallFields, now: Date): JoinState {
  if (
    appointment.status !== "CONFIRMED" ||
    appointment.consultation_type === "CHAT" ||
    !appointment.call_opens_at
  ) {
    return { kind: "hidden" };
  }
  const nowMs = now.getTime();
  if (nowMs >= new Date(appointment.scheduled_end).getTime()) return { kind: "closed" };
  const opensMs = new Date(appointment.call_opens_at).getTime();
  if (nowMs < opensMs) {
    return { kind: "locked", secondsUntilOpen: Math.ceil((opensMs - nowMs) / 1000) };
  }
  return { kind: "open" };
}

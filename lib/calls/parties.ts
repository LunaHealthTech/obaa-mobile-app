import type { Appointment } from "../../types/appointment.types";
import type { Call, Party, Role } from "../../types/call.types";

export type Counterpart = Pick<Party, "display_name" | "profile_pic" | "role">;

export const otherParty = (call: Call, me: string): Party =>
  call.caller.username === me ? call.callee : call.caller;

export function appointmentCounterpart(
  appointment: Pick<Appointment, "patient" | "midwife">,
  myRole: Role,
): Counterpart | null {
  if (myRole === "MIDWIFE") return appointment.patient;
  const { midwife } = appointment;
  return midwife
    ? { display_name: midwife.display_name, profile_pic: midwife.profile_pic, role: "MIDWIFE" }
    : null;
}

export const roleNoun = (role: Role) => (role === "MIDWIFE" ? "midwife" : "patient");

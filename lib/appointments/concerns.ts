import type { Concern } from "../../types/appointment.types";

export const concernOptions: readonly { code: Concern; label: string }[] = [
  { code: "PREGNANCY_SUPPORT", label: "Pregnancy Support" },
  { code: "MISSED_PERIOD", label: "Missed Period" },
  { code: "MENSTRUAL_CONCERNS", label: "Menstrual Concerns" },
  { code: "TEEN_HEALTH", label: "Teen Health" },
  { code: "SYMPTOMS", label: "Symptoms" },
  { code: "EMOTIONAL_SUPPORT", label: "Emotional Support" },
];

export function parseConcern(value: string | undefined): Concern | null {
  return concernOptions.find((c) => c.code === value)?.code ?? null;
}

// The API's concern_label groups concerns (both menstrual ones read "Menstrual
// Health"), so show the topic the patient actually picked.
export function concernLabel(concern: Concern): string {
  return concernOptions.find((c) => c.code === concern)?.label ?? concern;
}

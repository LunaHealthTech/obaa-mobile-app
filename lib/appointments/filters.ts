import type { MidwifeQuery } from "../../types/appointment.types";

export const midwifeFilters = [
  { label: "All", query: {} },
  { label: "Available Today", query: { available_today: "true" } },
  { label: "Pregnancy", query: { concern: "PREGNANCY_SUPPORT" } },
  // The API filters on one concern, so MISSED_PERIOD-only midwives are not
  // listed here.
  { label: "Menstrual Health", query: { concern: "MENSTRUAL_CONCERNS" } },
] as const satisfies readonly { label: string; query: MidwifeQuery }[];

export type MidwifeFilterLabel = (typeof midwifeFilters)[number]["label"];

export function midwifeQuery(
  filter: MidwifeFilterLabel,
  search: string,
): MidwifeQuery {
  const base = midwifeFilters.find((f) => f.label === filter)?.query ?? {};
  const q = search.trim();
  return q ? { ...base, q } : { ...base };
}

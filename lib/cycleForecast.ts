import { differenceInCalendarDays, parseISO } from "date-fns";
import type { UserCycleData } from "../types/menstrual.types";

export type PregnancyChance = "Very High" | "High" | "Low" | "Very Low";

export type RingPhase = "MENSTRUATING" | "FOLLICULAR" | "OVULATING" | "LUTEAL" | "MISSED";

type ForecastCycle = Pick<UserCycleData, "start_date" | "ovulation_day">;

type RingCycle = Pick<
  UserCycleData,
  "id" | "start_date" | "bleed_end_date" | "end_date" | "ovulation_day" | "cycle_length"
>;

const byStart = <T extends { start_date: string }>(cycles: T[]) =>
  [...cycles].sort((a, b) => a.start_date.localeCompare(b.start_date));

const daysFrom = (today: Date, isoDate: string) =>
  differenceInCalendarDays(parseISO(isoDate), today);

export function nextOvulation(
  today: Date,
  cycles: ForecastCycle[],
): { date: string; daysAway: number } | null {
  for (const cycle of byStart(cycles)) {
    if (cycle.ovulation_day == null) continue;
    const daysAway = daysFrom(today, cycle.ovulation_day);
    if (daysAway >= 0) return { date: cycle.ovulation_day, daysAway };
  }
  return null;
}

// Bands mirror the backend's MenstrualCycle.pregnancy_probability so the
// home card (server value) and the calendar agree.
export function pregnancyChance(today: Date, cycles: ForecastCycle[]): PregnancyChance | null {
  const owner = byStart(cycles)
    .filter((cycle) => daysFrom(today, cycle.start_date) <= 0)
    .at(-1);
  if (!owner?.ovulation_day) return null;
  const untilOvulation = daysFrom(today, owner.ovulation_day);
  if (untilOvulation > 6) return "Very Low";
  if (untilOvulation > 4) return "High";
  if (untilOvulation > 0) return "Very High";
  if (untilOvulation > -2) return "High";
  return "Low";
}

// Phase rules mirror the backend's MenstrualCycle.current_phase, so the ring,
// the home status card and the stale-cycle prompt agree. Projected cycles
// (no id) never own the ring: a period that hasn't arrived is a late cycle.
export function cycleRing(
  today: Date,
  cycles: RingCycle[],
  assumedBleedEnd: string | null = null,
): { day: number; totalDays: number; phase: RingPhase } | null {
  const real = byStart(cycles.filter((cycle) => cycle.id != null)).at(-1);
  if (!real) return null;
  const day = -daysFrom(today, real.start_date) + 1;
  const bleedEnd = [real.bleed_end_date, assumedBleedEnd]
    .filter((date): date is string => date != null)
    .sort()
    .at(-1);

  const phase = (): RingPhase => {
    if (!bleedEnd || daysFrom(today, bleedEnd) >= 0) return "MENSTRUATING";
    if (real.ovulation_day) {
      const untilOvulation = daysFrom(today, real.ovulation_day);
      if (untilOvulation > 0) return "FOLLICULAR";
      if (untilOvulation >= -1) return "OVULATING";
    }
    return daysFrom(today, real.end_date) >= 0 ? "LUTEAL" : "MISSED";
  };

  return { day, totalDays: real.cycle_length, phase: phase() };
}

export function ovulationLabel(daysAway: number): string {
  if (daysAway === 0) return "Today";
  if (daysAway === 1) return "Tomorrow";
  return `${daysAway} Days`;
}

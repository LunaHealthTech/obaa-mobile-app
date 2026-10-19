import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isValid,
  subDays,
} from "date-fns";
import {
  CyclePhase,
  DayMarking,
  GenerateDaysProps,
  UserCycleData,
} from "@/types/menstrual.types";

export function computeCycleDay(date: Date | string, cycle: UserCycleData) {
  return differenceInCalendarDays(new Date(date), new Date(cycle.start_date)) + 1;
}

export function computeCyclePhase(
  date: Date | string,
  cycle: UserCycleData,
): CyclePhase {
  const d = new Date(date);
  // No confirmed bleed_end_date yet means bleeding hasn't been marked
  // ended — treat as still menstrual rather than guessing.
  if (cycle.bleed_end_date == null || !isAfter(d, new Date(cycle.bleed_end_date))) {
    return "Menstrual";
  }
  if (cycle.ovulation_day == null) return "Follicular";
  const ovulation = new Date(cycle.ovulation_day);
  if (isSameDay(d, ovulation)) return "Ovulation";
  if (isBefore(d, ovulation)) return "Follicular";
  return "Luteal";
}

export function generateDays({
  startDate,
  endDate,
  colorCode,
  category,
  customProps,
  cycle,
}: GenerateDaysProps) {
  // startDate/endDate trace back to an unvalidated API response (see
  // services/menstrualService.ts), so a value typed as non-null string can
  // still arrive as null/undefined/malformed at runtime. `new Date(null)`
  // silently coerces to the Unix epoch instead of an invalid date, which
  // would otherwise make eachDayOfInterval walk ~20,000+ days.
  const start = startDate == null ? null : new Date(startDate);
  const end = endDate == null ? null : new Date(endDate);
  if (!start || !end || !isValid(start) || !isValid(end) || isAfter(start, end)) {
    if (__DEV__) {
      console.warn(
        `[CalendarHelpers] generateDays: skipping invalid range for category=${category} cycle=${cycle?.id ?? "n/a"} start=${String(startDate)} end=${String(endDate)}`,
      );
    }
    return {};
  }

  const dates = eachDayOfInterval({ start, end });
  let formattedDates: Record<string, DayMarking> = {};
  for (const date of dates) {
    let fDate = format(date, "yyyy-MM-dd");
    formattedDates[fDate] = {
      selected: true,
      selectedColor: colorCode,
      category: category,
      ...(cycle && {
        cycleId: cycle.id,
        predicted: cycle.predicted,
        cycleDay: computeCycleDay(date, cycle),
        phase: computeCyclePhase(date, cycle),
        cycleBleedEndDate: cycle.bleed_end_date,
      }),
      ...customProps,
    };
  }
  return formattedDates;
}

export const CONFIRMED_MENSTRUAL_STYLE = {
  container: {
    width: 35.43,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 40,
    position: "relative",
    bottom: 0,
  },
  text: { color: "white", fontSize: 14, textAlign: "center" },
};

export const PREDICTED_MENSTRUAL_STYLE = {
  container: {
    ...CONFIRMED_MENSTRUAL_STYLE.container,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#E82A73",
  },
  text: { color: "black", fontSize: 14, textAlign: "center" },
};

export function extractDates(
  dates: UserCycleData[],
): Record<string, DayMarking> {
  let res: Record<string, DayMarking> = {};
  for (const data of dates) {
    // The in-progress cycle legitimately may not have a confirmed
    // bleed_end_date/ovulation_day yet (see useConfirmedCycleStore's
    // "assumedRanges" mechanism, which exists for exactly this gap) — skip
    // only the affected layer instead of hiding everything known about the
    // cycle.
    let menstrualDays: Record<string, DayMarking> = {};
    let ovulationDays: Record<string, DayMarking> = {};
    const safeDays: Record<string, DayMarking> = {};

    if (data.bleed_end_date != null) {
      // The backend keeps predicted: true on a cycle the user started even
      // after its bleed is confirmed; only projected cycles lack an id.
      const isProjected = data.id == null;
      menstrualDays = generateDays({
        startDate: data.start_date,
        endDate: data.bleed_end_date,
        colorCode: isProjected ? "#FFFFFF" : "#E82A73",
        category: "MENSTRUAL",
        cycle: data,
        customProps: {
          customStyles: isProjected
            ? PREDICTED_MENSTRUAL_STYLE
            : CONFIRMED_MENSTRUAL_STYLE,
        },
      });
    } else if (__DEV__) {
      console.warn(
        `[CalendarHelpers] extractDates: cycle ${data.id} has no bleed_end_date yet, skipping menstrual markings`,
      );
    }

    if (data.ovulation_day != null) {
      const fertileWindowStyle = {
        customStyles: {
          container: {
            width: 35.43,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 40,
            bottom: 0,
          },
          text: { color: "black", fontSize: 14, textAlign: "center" },
        },
      };
      ovulationDays = {
        ...generateDays({
          startDate: subDays(data.ovulation_day, 2),
          endDate: subDays(data.ovulation_day, 1),
          colorCode: "#DEE4F5",
          category: "OVULATION",
          cycle: data,
          customProps: fertileWindowStyle,
        }),
        ...generateDays({
          startDate: addDays(data.ovulation_day, 1),
          endDate: addDays(data.ovulation_day, 2),
          colorCode: "#DEE4F5",
          category: "OVULATION",
          cycle: data,
          customProps: fertileWindowStyle,
        }),
        // Ovulation day itself is called out separately from the fertile window band
        ...generateDays({
          startDate: data.ovulation_day,
          endDate: data.ovulation_day,
          colorCode: "#07226B",
          category: "OVULATION",
          cycle: data,
          customProps: {
            customStyles: {
              container: fertileWindowStyle.customStyles.container,
              text: { color: "white", fontSize: 14, textAlign: "center" },
            },
          },
        }),
      };
    } else if (__DEV__) {
      console.warn(
        `[CalendarHelpers] extractDates: cycle ${data.id} has no ovulation_day yet, skipping fertile-window markings`,
      );
    }

    if (data.safe_days?.length) {
      for (const safeRange of data.safe_days) {
        Object.assign(
          safeDays,
          generateDays({
            startDate: safeRange.start_date,
            endDate: safeRange.end_date,
            colorCode: "#3CB9FB50",
            category: "NORMAL",
            cycle: data,
            customProps: {
              customStyles: {
                container: {
                  width: 35.43,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 40,
                  position: "relative",
                  bottom: 0,
                },
                text: { color: "black", fontSize: 14, textAlign: "center" },
              },
            },
          }),
        );
      }
    }

    // The backend's safe_days can overlap the period, so the period layer is
    // assigned last to keep its pink marking.
    Object.assign(res, ovulationDays, safeDays, menstrualDays);
  }
  return res;
}

/**
 * An assumed range is only still useful while the real backend cycle hasn't
 * caught up to it yet. If the cycle no longer exists, or its real
 * bleed_end_date has reached/passed what we assumed, real data should win.
 */
export function isAssumedRangeActive(
  range: { startDate: string; bleedEndDate: string },
  realCycle: UserCycleData | undefined,
): boolean {
  if (!realCycle) return false;
  // No confirmed bleed_end_date yet means real data hasn't caught up —
  // the assumed range is still the best information available.
  if (realCycle.bleed_end_date == null) return true;
  return realCycle.bleed_end_date < range.bleedEndDate;
}

export function applyAssumedConfirmedRanges(
  markedDates: Record<string, DayMarking>,
  ranges: Record<number, { startDate: string; bleedEndDate: string }>,
  cycles: UserCycleData[],
): Record<string, DayMarking> {
  const result = { ...markedDates };
  for (const [cycleIdStr, range] of Object.entries(ranges)) {
    const cycleId = Number(cycleIdStr);
    const realCycle = cycles.find((c) => c.id === cycleId);
    if (!isAssumedRangeActive(range, realCycle)) continue;
    const confirmedDays = generateDays({
      startDate: range.startDate,
      endDate: range.bleedEndDate,
      colorCode: "#E82A73",
      category: "MENSTRUAL",
      cycle: {
        id: cycleId,
        start_date: range.startDate,
        bleed_end_date: range.bleedEndDate,
        end_date: range.bleedEndDate,
        safe_days: [],
        ovulation_day: range.startDate,
        cycle_length: 0,
        predicted: false,
      },
      customProps: { customStyles: CONFIRMED_MENSTRUAL_STYLE },
    });
    Object.assign(result, confirmedDays);
  }
  return result;
}

/**
 * A cycle "owns" every date from its start_date up to (but not including) the
 * next cycle's start_date, or indefinitely if it's the last one. `sortedCycles`
 * must be sorted ascending by start_date (see `useCycles.ts`'s `useCycleList`).
 */
export function findOwningCycle(
  date: string,
  sortedCycles: UserCycleData[],
): UserCycleData | null {
  let owner: UserCycleData | null = null;
  for (const cycle of sortedCycles) {
    if (cycle.start_date <= date) owner = cycle;
    else break;
  }
  return owner;
}

export function findNextCycle(
  cycle: UserCycleData,
  sortedCycles: UserCycleData[],
): UserCycleData | null {
  const idx = sortedCycles.indexOf(cycle);
  return idx >= 0 ? (sortedCycles[idx + 1] ?? null) : null;
}

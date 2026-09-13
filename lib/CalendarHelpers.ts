import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  isAfter,
  isBefore,
  isSameDay,
  subDays,
} from "date-fns";
import {
  CurrentCyclePhase,
  CyclePhase,
  DayMarking,
  GenerateDaysProps,
  UserCycleData,
} from "@/types/menstrual.types";

export type RingPhase = "MENSTRUATING" | "FOLLICULAR" | "OVULATING" | "LUTEAL";

const PHASE_NORMALIZATION: Record<CurrentCyclePhase, RingPhase | null> = {
  menstrual: "MENSTRUATING",
  follicular: "FOLLICULAR",
  ovulation: "OVULATING",
  luteal: "LUTEAL",
  completed: null,
  upcoming: null,
};

export function normalizeCyclePhase(phase: CurrentCyclePhase): RingPhase {
  return PHASE_NORMALIZATION[phase] ?? "FOLLICULAR";
}

export function computeCycleDay(date: Date | string, cycle: UserCycleData) {
  return differenceInCalendarDays(new Date(date), new Date(cycle.start_date)) + 1;
}

export function computeCyclePhase(
  date: Date | string,
  cycle: UserCycleData,
): CyclePhase {
  const d = new Date(date);
  const bleedEnd = new Date(cycle.bleed_end_date);
  const ovulation = new Date(cycle.ovulation_day);

  if (!isAfter(d, bleedEnd)) return "Menstrual";
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
  const dates = eachDayOfInterval({ start: startDate, end: endDate });
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
    const menstrualOptions = {
      startDate: data.start_date,
      endDate: data.bleed_end_date,
      colorCode: data.predicted ? "#FFFFFF" : "#E82A73",
      category: "MENSTRUAL",
      cycle: data,
      customProps: {
        customStyles: data.predicted
          ? PREDICTED_MENSTRUAL_STYLE
          : CONFIRMED_MENSTRUAL_STYLE,
      },
    };
    const menstrualDays = generateDays(menstrualOptions);
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
    const ovulationDays = {
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

    const safeDays: Record<string, DayMarking> = {};
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

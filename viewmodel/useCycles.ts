import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMenstrualCycles } from "@/services/menstrualService";
import {
  applyAssumedConfirmedRanges,
  extractDates,
  isAssumedRangeActive,
} from "@/lib/CalendarHelpers";
import { useConfirmedCycleStore } from "@/repositories/useConfirmedCycleStore";
import { cycleRing, nextOvulation, pregnancyChance } from "@/lib/cycleForecast";
import { useNow } from "@/lib/useNow";
import type { UserCycleData } from "@/types/menstrual.types";

export function useMenstrualCycles() {
  const ranges = useConfirmedCycleStore((s) => s.ranges);
  const queryKey = ["/menstrual/cycles"];

  const select = useCallback(
    (data: UserCycleData[]) => {
      const extractedDays = extractDates(data);
      return applyAssumedConfirmedRanges(extractedDays, ranges, data);
    },
    [ranges],
  );

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: getMenstrualCycles,
    select,
    staleTime: 24 * 60 * 1000, // 24 mins
  });

  return {
    menstrualCycles: data,
    isLoadingMenstrualCycles: isLoading,
    isMenstrualCyclesError: isError,
  };
}

function sortCyclesByStartDate(data: UserCycleData[]) {
  return [...data].sort((a, b) => a.start_date.localeCompare(b.start_date));
}

export function useCycleList() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["/menstrual/cycles"],
    queryFn: getMenstrualCycles,
    select: sortCyclesByStartDate,
    staleTime: 24 * 60 * 1000, // 24 mins
  });

  return {
    sortedCycles: data ?? [],
    isLoadingCycles: isLoading,
    isCyclesError: isError,
    cyclesError: error,
    refetchCycles: refetch,
  };
}

const MINUTE_MS = 60 * 1000;

// Read off the same cycles the calendar draws, so the cards match the
// highlighted days. Re-evaluated every minute to roll over at midnight.
export function useCycleForecast() {
  const { sortedCycles } = useCycleList();
  const ranges = useConfirmedCycleStore((s) => s.ranges);
  const now = useNow(MINUTE_MS);

  const realCycle = sortedCycles.filter((cycle) => cycle.id != null).at(-1);
  const assumed = realCycle?.id != null ? ranges[realCycle.id] : undefined;
  const assumedBleedEnd =
    assumed && isAssumedRangeActive(assumed, realCycle) ? assumed.bleedEndDate : null;

  return {
    ring: cycleRing(now, sortedCycles, assumedBleedEnd),
    nextOvulation: nextOvulation(now, sortedCycles),
    pregnancyChance: pregnancyChance(now, sortedCycles),
  };
}

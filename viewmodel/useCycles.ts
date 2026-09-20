import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMenstrualCycles } from "@/services/menstrualService";
import { applyAssumedConfirmedRanges, extractDates } from "@/lib/CalendarHelpers";
import { useConfirmedCycleStore } from "@/repositories/useConfirmedCycleStore";
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

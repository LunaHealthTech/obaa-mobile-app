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
      return applyAssumedConfirmedRanges(extractedDays, ranges);
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

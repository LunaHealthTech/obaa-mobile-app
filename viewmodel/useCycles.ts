import { useQuery } from "@tanstack/react-query";
import { getMenstrualCycles } from "@/services/menstrualService";
import { extractDates } from "@/lib/CalendarHelpers";

export function useMenstrualCycles() {
  const queryKey = ["/menstrual/cycles"];
  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: getMenstrualCycles,
    select: (data) => {
      let extractedDays = extractDates(data);
      return extractedDays;
    },
    staleTime: 24 * 60 * 1000, // 24 mins
  });

  return {
    menstrualCycles: data,
    isLoadingMenstrualCycles: isLoading,
    isMenstrualCyclesError: isError,
  };
}

import { useQuery } from "@tanstack/react-query";
import { getLogs } from "@/services/logService";

export function useDayLog(date: string | null) {
  const queryKey = ["/logs", date];
  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => getLogs({ date: date! }),
    select: (data) => data[0] ?? null,
    enabled: !!date,
  });

  return {
    log: data,
    isLoadingLog: isLoading,
    isLogError: isError,
  };
}

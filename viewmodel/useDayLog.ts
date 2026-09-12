import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { toast } from "sonner-native";
import { createLog, getLogs, updateLog } from "@/services/logService";
import type { CreateLogPayload } from "@/types/menstrual.types";

export function useDayLog(date: string | null) {
  const queryKey = ["/logs", date];
  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => getLogs({ date: date! }),
    select: (data) => data[0] ?? null,
    enabled: !!date,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: CreateLogPayload) =>
      data ? updateLog(payload) : createLog(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Log saved");
    },
    onError: () => toast.error("Something went wrong saving your log"),
  });

  return {
    log: data,
    isLoadingLog: isLoading,
    isLogError: isError,
    saveLog: saveMutation.mutate,
    isSavingLog: saveMutation.isPending,
  };
}

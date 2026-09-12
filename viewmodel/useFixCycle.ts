import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { toast } from "sonner-native";
import { extractErrorMessage } from "@/lib/apiClient";
import { endPeriod, startCycle, updateCycle } from "@/services/menstrualService";
import { useFixCycleStore } from "@/repositories/useFixCycleStore";

function invalidateCycleQueries() {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["/menstrual/cycles"] }),
    queryClient.invalidateQueries({ queryKey: ["/menstrual/profile/"] }),
  ]);
}

export function useFixCycle() {
  const saveMutation = useMutation({
    mutationFn: async () => {
      const { cycleId, periodStart, bleedingEnd, nextPeriodStart } =
        useFixCycleStore.getState();

      if (cycleId) {
        await updateCycle(cycleId, { start_date: periodStart });
      } else {
        await startCycle({ start_date: periodStart });
      }
      await endPeriod({ end_date: bleedingEnd });
      await startCycle({ start_date: nextPeriodStart });
    },
    onSuccess: async () => {
      await invalidateCycleQueries();
      useFixCycleStore.getState().setStep("success");
    },
    onError: (error) => {
      toast.error(
        extractErrorMessage(error, "Something went wrong updating your cycle"),
      );
    },
  });

  return {
    save: saveMutation.mutate,
    isSaving: saveMutation.isPending,
  };
}

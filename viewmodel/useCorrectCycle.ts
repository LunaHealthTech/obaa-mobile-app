import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { toast } from "sonner-native";
import { extractErrorMessage } from "@/lib/apiClient";
import { endPeriod, startCycle, updateCycle } from "@/services/menstrualService";
import { useCycleFlowStore } from "@/repositories/useCycleFlowStore";
import { useConfirmedCycleStore } from "@/repositories/useConfirmedCycleStore";

function invalidateCycleQueries() {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["/menstrual/cycles"] }),
    queryClient.invalidateQueries({ queryKey: ["/menstrual/profile/"] }),
  ]);
}

export function useCorrectCycle() {
  const saveMutation = useMutation({
    mutationFn: async () => {
      const state = useCycleFlowStore.getState().state;
      if (state.mode !== "old-cycle-correction") return;
      const { variant, tappedCycleId, nextCycleId, periodStart, bleedingEnd, nextPeriodStart } =
        state;

      if (variant === "closed-cycle") {
        if (tappedCycleId == null) {
          throw new Error("Missing cycle id for correction");
        }
        await updateCycle(tappedCycleId, {
          start_date: periodStart,
          bleed_end_date: bleedingEnd,
        });
        if (nextCycleId != null) {
          await updateCycle(nextCycleId, { start_date: nextPeriodStart });
        }
        useConfirmedCycleStore.getState().clearAssumedRange(tappedCycleId);
      } else {
        if (tappedCycleId) {
          await updateCycle(tappedCycleId, { start_date: periodStart });
        } else {
          await startCycle({ start_date: periodStart });
        }
        await endPeriod({ end_date: bleedingEnd });
        await startCycle({ start_date: nextPeriodStart });
      }
    },
    onSuccess: async () => {
      await invalidateCycleQueries();
      useCycleFlowStore.getState().advance("success");
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

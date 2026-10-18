import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { toast } from "sonner-native";
import { extractErrorMessage } from "@/lib/apiClient";
import { endPeriod, startCycle, updateCycle } from "@/services/menstrualService";
import { useCycleFlowStore } from "@/repositories/useCycleFlowStore";
import { useConfirmedCycleStore } from "@/repositories/useConfirmedCycleStore";
import type { UserCycleData } from "@/types/menstrual.types";

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
        if (nextCycleId != null && nextPeriodStart != null) {
          await updateCycle(nextCycleId, { start_date: nextPeriodStart });
        }
        useConfirmedCycleStore.getState().clearAssumedRange(tappedCycleId);
      } else {
        const staleCycle = queryClient
          .getQueryData<UserCycleData[]>(["/menstrual/cycles"])
          ?.find((c) => c.id === tappedCycleId);
        // A start date after the stale cycle's recorded bleed is a new period:
        // start a fresh cycle rather than moving the old one's start past its
        // own bleed_end_date, which the backend rejects and which would erase
        // the old cycle from history.
        const isNewPeriod =
          !tappedCycleId ||
          (staleCycle?.bleed_end_date != null && periodStart > staleCycle.bleed_end_date);

        if (isNewPeriod) {
          await startCycle({ start_date: periodStart });
        } else {
          await updateCycle(tappedCycleId, {
            start_date: periodStart,
            bleed_end_date: bleedingEnd,
          });
        }
        await endPeriod({ end_date: bleedingEnd });
        if (nextPeriodStart != null) {
          await startCycle({ start_date: nextPeriodStart });
        }
        if (tappedCycleId) {
          useConfirmedCycleStore.getState().clearAssumedRange(tappedCycleId);
        }
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

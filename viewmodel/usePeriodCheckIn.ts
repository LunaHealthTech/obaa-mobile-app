import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { toast } from "sonner-native";
import { extractErrorMessage } from "@/lib/apiClient";
import { endPeriod, startCycle } from "@/services/menstrualService";
import { createLog, updateLog } from "@/services/logService";
import { useCycleFlowStore } from "@/repositories/useCycleFlowStore";
import { useConfirmedCycleStore } from "@/repositories/useConfirmedCycleStore";
import { useDayLog } from "@/viewmodel/useDayLog";

function invalidateCycleQueries() {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["/menstrual/cycles"] }),
    queryClient.invalidateQueries({ queryKey: ["/menstrual/profile/"] }),
  ]);
}

function useCurrentCycleFlow() {
  return useCycleFlowStore((s) => (s.state.mode === "current-cycle" ? s.state : null));
}

export function useSaveCycleDate() {
  const flow = useCurrentCycleFlow();
  const assumedBleedEndDate = flow?.assumedBleedEndDate ?? null;

  const saveMutation = useMutation({
    mutationFn: async (date: string) => startCycle({ start_date: date }),
    onSuccess: async (started, date) => {
      await invalidateCycleQueries();
      if (started?.id && assumedBleedEndDate) {
        useConfirmedCycleStore
          .getState()
          .setAssumedRange(started.id, date, assumedBleedEndDate);
      }
    },
    onError: (error) => {
      toast.error(
        extractErrorMessage(error, "Something went wrong saving your date"),
      );
    },
  });

  return {
    save: saveMutation.mutate,
    isSaving: saveMutation.isPending,
  };
}

export function useSaveCycleEndDate() {
  const flow = useCurrentCycleFlow();
  const cycleId = flow?.cycleId ?? null;

  const saveMutation = useMutation({
    mutationFn: async (endDate: string) => {
      await endPeriod({ end_date: endDate });
    },
    onSuccess: async () => {
      await invalidateCycleQueries();
      if (cycleId) {
        useConfirmedCycleStore.getState().clearAssumedRange(cycleId);
      }
    },
    onError: (error) => {
      toast.error(
        extractErrorMessage(
          error,
          "Something went wrong saving your period's end date",
        ),
      );
    },
  });

  return {
    save: saveMutation.mutate,
    isSaving: saveMutation.isPending,
  };
}

export function usePeriodCheckIn() {
  const flow = useCurrentCycleFlow();
  const date = flow?.date ?? "";
  const moods = flow?.moods ?? [];
  const symptoms = flow?.symptoms ?? [];
  const { log } = useDayLog(date);

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Flow intensity (Light/Medium/Heavy/Spotting) has no backing field on
      // Log or MenstrualCycle in Sturdy Engine API.yaml yet — it's captured in
      // useCycleFlowStore but intentionally left out of this payload until
      // the backend adds somewhere to put it.
      const payload = { date, mood: moods.join(", "), symptoms };
      if (log) {
        await updateLog(payload);
      } else {
        await createLog(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/logs", date] });
    },
    onError: (error) => {
      toast.error(
        extractErrorMessage(error, "Something went wrong saving your check-in"),
      );
    },
  });

  return {
    save: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    isSaved: saveMutation.isSuccess,
  };
}

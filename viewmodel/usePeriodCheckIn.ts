import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { toast } from "sonner-native";
import { extractErrorMessage } from "@/lib/apiClient";
import { endPeriod, startCycle } from "@/services/menstrualService";
import { createLog, updateLog } from "@/services/logService";
import { usePeriodCheckInStore } from "@/repositories/usePeriodCheckInStore";
import { useConfirmedCycleStore } from "@/repositories/useConfirmedCycleStore";
import { useDayLog } from "@/viewmodel/useDayLog";

function invalidateCycleQueries() {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["/menstrual/cycles"] }),
    queryClient.invalidateQueries({ queryKey: ["/menstrual/profile/"] }),
  ]);
}

export function useSaveCycleDate() {
  const { cycleId, assumedBleedEndDate } = usePeriodCheckInStore();

  const saveMutation = useMutation({
    mutationFn: async (date: string) => {
      if (cycleId) {
        await endPeriod({ end_date: date });
        return null;
      }
      const started = await startCycle({ start_date: date });
      return started;
    },
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
  const { cycleId } = usePeriodCheckInStore();

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
  const { date, moods, symptoms } = usePeriodCheckInStore();
  const { log } = useDayLog(date);

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Flow intensity (Light/Medium/Heavy/Spotting) has no backing field on
      // Log or MenstrualCycle in Sturdy Engine API.yaml yet — it's captured in
      // usePeriodCheckInStore but intentionally left out of this payload until
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

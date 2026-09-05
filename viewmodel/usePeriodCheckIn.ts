import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { toast } from "sonner-native";
import { startCycle, updateCycle } from "@/services/menstrualService";
import { createLog } from "@/services/logService";
import { usePeriodCheckInStore } from "@/repositories/usePeriodCheckInStore";

function invalidateCycleQueries() {
  queryClient.invalidateQueries({ queryKey: ["/menstrual/cycles"] });
  queryClient.invalidateQueries({ queryKey: ["/menstrual/profile/"] });
}

export function usePeriodCheckIn() {
  const { mode, date, cycleId, symptoms } = usePeriodCheckInStore();

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (mode === "edit" && cycleId) {
        await updateCycle(cycleId, { start_date: date });
      } else {
        await startCycle({ start_date: date });
      }
      // Flow intensity (Light/Medium/Heavy/Spotting) has no backing field on
      // Log or MenstrualCycle in Sturdy Engine API.yaml yet — it's captured in
      // usePeriodCheckInStore but intentionally left out of this payload until
      // the backend adds somewhere to put it.
      await createLog({ date, mood: "", symptoms });
    },
    onSuccess: () => {
      invalidateCycleQueries();
    },
    onError: () => {
      toast.error("Something went wrong saving your check-in");
    },
  });

  return {
    save: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    isSaved: saveMutation.isSuccess,
  };
}

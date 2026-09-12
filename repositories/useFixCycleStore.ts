import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { zustandMMKVStorage } from "@/services/mmkvStorage";
import { format } from "date-fns";
import type { FixCycleState } from "@/types/menstrual.types";

export const useFixCycleStore = create<FixCycleState>()(
  persist(
    (set, get) => ({
      step: null,
      cycleId: null,
      periodStart: format(new Date(), "yyyy-MM-dd"),
      bleedingEnd: format(new Date(), "yyyy-MM-dd"),
      nextPeriodStart: format(new Date(), "yyyy-MM-dd"),
      dismissedCycleId: null,

      start: ({ cycleId }) =>
        set({
          cycleId,
          step: "intro",
          periodStart: format(new Date(), "yyyy-MM-dd"),
          bleedingEnd: format(new Date(), "yyyy-MM-dd"),
          nextPeriodStart: format(new Date(), "yyyy-MM-dd"),
        }),
      setStep: (step) => set({ step }),
      setPeriodStart: (periodStart) => set({ periodStart }),
      setBleedingEnd: (bleedingEnd) => set({ bleedingEnd }),
      setNextPeriodStart: (nextPeriodStart) => set({ nextPeriodStart }),
      dismiss: () => set({ dismissedCycleId: get().cycleId, step: null }),
      close: () => set({ step: null }),
      reset: () =>
        set({
          step: null,
          cycleId: null,
          periodStart: format(new Date(), "yyyy-MM-dd"),
          bleedingEnd: format(new Date(), "yyyy-MM-dd"),
          nextPeriodStart: format(new Date(), "yyyy-MM-dd"),
        }),
    }),
    {
      name: "fix-cycle-storage",
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: (state) => ({ dismissedCycleId: state.dismissedCycleId }),
    },
  ),
);

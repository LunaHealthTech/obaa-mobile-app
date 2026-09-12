import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { zustandMMKVStorage } from "@/services/mmkvStorage";
import type { ConfirmedCycleState } from "@/types/menstrual.types";

export const useConfirmedCycleStore = create<ConfirmedCycleState>()(
  persist(
    (set) => ({
      ranges: {},
      setAssumedRange: (cycleId, startDate, bleedEndDate) =>
        set((state) => ({
          ranges: {
            ...state.ranges,
            [cycleId]: { startDate, bleedEndDate },
          },
        })),
      clearAssumedRange: (cycleId) =>
        set((state) => {
          const { [cycleId]: _removed, ...rest } = state.ranges;
          return { ranges: rest };
        }),
    }),
    {
      name: "confirmed-cycle-storage",
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);

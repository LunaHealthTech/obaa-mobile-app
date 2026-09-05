import { create } from "zustand";
import type { PeriodCheckInState } from "@/types/menstrual.types";

export const usePeriodCheckInStore = create<PeriodCheckInState>((set) => ({
  mode: "confirm",
  date: "",
  cycleId: null,
  flowIntensity: null,
  symptoms: [],

  start: ({ mode, date, cycleId }) =>
    set({ mode, date, cycleId, flowIntensity: null, symptoms: [] }),
  setDate: (date) => set({ date }),
  setFlowIntensity: (flowIntensity) => set({ flowIntensity }),
  toggleSymptom: (symptom) =>
    set((state) => ({
      symptoms: state.symptoms.includes(symptom)
        ? state.symptoms.filter((s) => s !== symptom)
        : [...state.symptoms, symptom],
    })),
  reset: () =>
    set({ mode: "confirm", date: "", cycleId: null, flowIntensity: null, symptoms: [] }),
}));

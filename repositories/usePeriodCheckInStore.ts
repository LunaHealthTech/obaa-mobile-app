import { create } from "zustand";
import type { PeriodCheckInState } from "@/types/menstrual.types";

export const usePeriodCheckInStore = create<PeriodCheckInState>((set) => ({
  mode: "confirm",
  date: "",
  cycleId: null,
  flowIntensity: null,
  symptoms: [],
  step: null,

  start: ({ mode, date, cycleId, step }) =>
    set({ mode, date, cycleId, step, flowIntensity: null, symptoms: [] }),
  setStep: (step) => set({ step }),
  setDate: (date) => set({ date }),
  setFlowIntensity: (flowIntensity) => set({ flowIntensity }),
  toggleSymptom: (symptom) =>
    set((state) => ({
      symptoms: state.symptoms.includes(symptom)
        ? state.symptoms.filter((s) => s !== symptom)
        : [...state.symptoms, symptom],
    })),
  close: () => set({ step: null }),
  reset: () =>
    set({ mode: "confirm", date: "", cycleId: null, flowIntensity: null, symptoms: [], step: null }),
}));

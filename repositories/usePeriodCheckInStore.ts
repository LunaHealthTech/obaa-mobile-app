import { create } from "zustand";
import type { PeriodCheckInState } from "@/types/menstrual.types";

export const usePeriodCheckInStore = create<PeriodCheckInState>((set) => ({
  date: "",
  cycleId: null,
  assumedBleedEndDate: null,
  flowIntensity: null,
  moods: [],
  symptoms: [],
  step: null,

  start: ({ date, cycleId, assumedBleedEndDate, step }) =>
    set({
      date,
      cycleId,
      assumedBleedEndDate: assumedBleedEndDate ?? null,
      step,
      flowIntensity: null,
      moods: [],
      symptoms: [],
    }),
  setStep: (step) => set({ step }),
  setDate: (date) => set({ date }),
  setFlowIntensity: (flowIntensity) => set({ flowIntensity }),
  toggleMood: (mood) =>
    set((state) => ({
      moods: state.moods.includes(mood)
        ? state.moods.filter((m) => m !== mood)
        : [...state.moods, mood],
    })),
  toggleSymptom: (symptom) =>
    set((state) => ({
      symptoms: state.symptoms.includes(symptom)
        ? state.symptoms.filter((s) => s !== symptom)
        : [...state.symptoms, symptom],
    })),
  close: () => set({ step: null }),
  reset: () =>
    set({
      date: "",
      cycleId: null,
      assumedBleedEndDate: null,
      flowIntensity: null,
      moods: [],
      symptoms: [],
      step: null,
    }),
}));

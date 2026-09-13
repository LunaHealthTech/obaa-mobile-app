import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { format } from "date-fns";
import { zustandMMKVStorage } from "@/services/mmkvStorage";
import type {
  CorrectionStep,
  CurrentCycleStep,
  CycleFlowEvent,
  CycleFlowState,
  CycleFlowStore,
} from "@/types/menstrual.types";

const today = () => format(new Date(), "yyyy-MM-dd");

export function transition(state: CycleFlowState, event: CycleFlowEvent): CycleFlowState {
  switch (event.type) {
    case "OPEN_OLD_CYCLE":
      return {
        mode: "old-cycle-correction",
        variant: "closed-cycle",
        step: "period-start",
        tappedCycleId: event.tappedCycleId,
        nextCycleId: event.nextCycleId,
        periodStart: event.seed.periodStart,
        bleedingEnd: event.seed.bleedingEnd,
        nextPeriodStart: event.seed.nextPeriodStart,
      };

    case "OPEN_CURRENT_CYCLE":
      return {
        mode: "current-cycle",
        step: "log",
        date: event.date,
        cycleId: event.cycleId,
        assumedBleedEndDate: event.assumedBleedEndDate,
        flowIntensity: null,
        moods: [],
        symptoms: [],
      };

    case "OPEN_STALE_FIX":
      if (state.mode !== "idle") return state;
      return {
        mode: "old-cycle-correction",
        variant: "stale-current",
        step: "intro",
        tappedCycleId: event.cycleId,
        nextCycleId: null,
        periodStart: today(),
        bleedingEnd: today(),
        nextPeriodStart: today(),
      };

    case "STEP": {
      if (state.mode === "idle") return state;
      if (state.mode === "current-cycle") {
        return { ...state, step: event.step as CurrentCycleStep };
      }
      return { ...state, step: event.step as CorrectionStep };
    }

    case "BACK": {
      if (state.mode === "idle") return state;
      if (state.mode === "current-cycle") {
        if (state.step === "symptoms") return { ...state, step: "flow-intensity" };
        return state;
      }
      switch (state.step) {
        case "period-start":
          return state.variant === "stale-current" ? { ...state, step: "intro" } : state;
        case "bleeding-end":
          return { ...state, step: "period-start" };
        case "next-period-start":
          return { ...state, step: "bleeding-end" };
        case "summary":
          return { ...state, step: "next-period-start" };
        default:
          return state;
      }
    }

    case "SET_DATE":
      return state.mode === "current-cycle" ? { ...state, date: event.date } : state;

    case "SET_FLOW_INTENSITY":
      return state.mode === "current-cycle"
        ? { ...state, flowIntensity: event.flowIntensity }
        : state;

    case "TOGGLE_MOOD":
      if (state.mode !== "current-cycle") return state;
      return {
        ...state,
        moods: state.moods.includes(event.mood)
          ? state.moods.filter((m) => m !== event.mood)
          : [...state.moods, event.mood],
      };

    case "TOGGLE_SYMPTOM":
      if (state.mode !== "current-cycle") return state;
      return {
        ...state,
        symptoms: state.symptoms.includes(event.symptom)
          ? state.symptoms.filter((s) => s !== event.symptom)
          : [...state.symptoms, event.symptom],
      };

    case "SET_PERIOD_START":
      return state.mode === "old-cycle-correction" ? { ...state, periodStart: event.date } : state;

    case "SET_BLEEDING_END":
      return state.mode === "old-cycle-correction" ? { ...state, bleedingEnd: event.date } : state;

    case "SET_NEXT_PERIOD_START":
      return state.mode === "old-cycle-correction"
        ? { ...state, nextPeriodStart: event.date }
        : state;

    case "CLOSE":
    case "DISMISS":
    case "RESET":
      return { mode: "idle" };

    default:
      return state;
  }
}

export const useCycleFlowStore = create<CycleFlowStore>()(
  persist(
    (set, get) => ({
      state: { mode: "idle" },
      dismissedCycleId: null,

      openForOldCycle: (params) =>
        set({
          state: transition(get().state, {
            type: "OPEN_OLD_CYCLE",
            date: params.date,
            tappedCycleId: params.tappedCycleId,
            nextCycleId: params.nextCycleId,
            seed: params.seed,
          }),
        }),
      openForCurrentCycle: (params) =>
        set({
          state: transition(get().state, {
            type: "OPEN_CURRENT_CYCLE",
            date: params.date,
            cycleId: params.cycleId,
            assumedBleedEndDate: params.assumedBleedEndDate ?? null,
          }),
        }),
      openForStaleFix: (params) =>
        set({ state: transition(get().state, { type: "OPEN_STALE_FIX", cycleId: params.cycleId }) }),

      advance: (step) => set({ state: transition(get().state, { type: "STEP", step }) }),
      back: () => set({ state: transition(get().state, { type: "BACK" }) }),
      setDate: (date) => set({ state: transition(get().state, { type: "SET_DATE", date }) }),
      setFlowIntensity: (flowIntensity) =>
        set({ state: transition(get().state, { type: "SET_FLOW_INTENSITY", flowIntensity }) }),
      toggleMood: (mood) => set({ state: transition(get().state, { type: "TOGGLE_MOOD", mood }) }),
      toggleSymptom: (symptom) =>
        set({ state: transition(get().state, { type: "TOGGLE_SYMPTOM", symptom }) }),
      setPeriodStart: (date) =>
        set({ state: transition(get().state, { type: "SET_PERIOD_START", date }) }),
      setBleedingEnd: (date) =>
        set({ state: transition(get().state, { type: "SET_BLEEDING_END", date }) }),
      setNextPeriodStart: (date) =>
        set({ state: transition(get().state, { type: "SET_NEXT_PERIOD_START", date }) }),

      close: () => set({ state: transition(get().state, { type: "CLOSE" }) }),
      dismiss: () =>
        set((s) => ({
          dismissedCycleId:
            s.state.mode === "old-cycle-correction" ? s.state.tappedCycleId : s.dismissedCycleId,
          state: transition(s.state, { type: "DISMISS" }),
        })),
      reset: () => set({ state: transition(get().state, { type: "RESET" }) }),
    }),
    {
      name: "cycle-flow-storage",
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: (state) => ({ dismissedCycleId: state.dismissedCycleId }),
    },
  ),
);

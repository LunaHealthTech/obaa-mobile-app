export interface FormattedMenstrualProfileInfo {
  status: string;
  pregnancyProbability: string;
  cycleLength: number;
  periodLength: number;
  whenPeriodStartedInDays: number;
}

export type CurrentCyclePhase =
  | "menstrual"
  | "follicular"
  | "ovulation"
  | "luteal"
  | "completed"
  | "upcoming";

export interface MenstrualProfileInfo {
  id: number;
  cycle_length: number;
  period_length: number;
  last_period_start: string;
  notification_pref: number;
  current_cycle: {
    id: number;
    start_date: string;
    bleed_end_date: string;
    end_date: string;
    current_phase: CurrentCyclePhase;
    next_phase_start: string;
    safe_days: { start_date: string; end_date: string }[];
    ovulation_day: string;
    cycle_length: number;
    pregnancy_probability: string;
    predicted: boolean;
    paused: boolean;
  };
  next_cycle_start_window: {
    lower: string;
    likely_start: string;
    upper: string;
  };
  status: string;
}
export type CyclePhase = "Menstrual" | "Follicular" | "Ovulation" | "Luteal";

export interface GenerateDaysProps {
  startDate: Date | string;
  endDate: Date | string;
  colorCode: string;
  category: "MENSTRUAL" | "NORMAL" | "OVULATION";
  customProps?: {};
  cycle?: UserCycleData;
  // status: "PREDICTED" | "ACTUAL";
}

export type UserCycleData = {
  id: null | number;
  start_date: string;
  bleed_end_date: string;
  end_date: string;
  safe_days: {
    start_date: string;
    end_date: string;
  }[];
  ovulation_day: string;
  cycle_length: number;
  predicted: boolean;
};

export interface DayMarking {
  selected: boolean;
  selectedColor: string;
  category: "MENSTRUAL" | "NORMAL" | "OVULATION";
  cycleId?: number | null;
  predicted?: boolean;
  cycleDay?: number;
  phase?: CyclePhase;
  customStyles?: { container: object; text: object };
  cycleBleedEndDate?: string;
}

export interface LogEntry {
  id: number;
  kindred: number;
  date: string;
  symptoms: string[];
  mood: string;
}

export interface CreateLogPayload {
  date: string;
  mood: string;
  symptoms: string[];
}

export interface GetLogsParams {
  date?: string;
  "range-start"?: string;
  "range-end"?: string;
}

export type CorrectionStep =
  | "intro"
  | "period-start"
  | "bleeding-end"
  | "next-period-start"
  | "summary"
  | "success";

export type CorrectionVariant = "closed-cycle" | "stale-current";

export type CurrentCycleStep =
  | "log"
  | "not-yet"
  | "flow-intensity"
  | "symptoms"
  | "confirmation"
  | "end-date";

export type CycleFlowState =
  | { mode: "idle" }
  | {
      mode: "current-cycle";
      step: CurrentCycleStep;
      date: string;
      cycleId: number | null;
      assumedBleedEndDate: string | null;
      flowIntensity: string | null;
      moods: string[];
      symptoms: string[];
    }
  | {
      mode: "old-cycle-correction";
      variant: CorrectionVariant;
      step: CorrectionStep;
      tappedCycleId: number | null;
      nextCycleId: number | null;
      periodStart: string;
      bleedingEnd: string;
      nextPeriodStart: string | null;
      cycleLength: number | null;
    };

export type CycleFlowEvent =
  | {
      type: "OPEN_OLD_CYCLE";
      date: string;
      tappedCycleId: number;
      nextCycleId: number | null;
      seed: { periodStart: string; bleedingEnd: string; nextPeriodStart: string };
      cycleLength: number | null;
    }
  | {
      type: "OPEN_CURRENT_CYCLE";
      date: string;
      cycleId: number | null;
      assumedBleedEndDate: string | null;
    }
  | { type: "OPEN_STALE_FIX"; cycleId: number | null; cycleLength: number | null }
  | { type: "STEP"; step: CorrectionStep | CurrentCycleStep }
  | { type: "BACK" }
  | { type: "SET_DATE"; date: string }
  | { type: "SET_FLOW_INTENSITY"; flowIntensity: string }
  | { type: "TOGGLE_MOOD"; mood: string }
  | { type: "TOGGLE_SYMPTOM"; symptom: string }
  | { type: "SET_PERIOD_START"; date: string }
  | { type: "SET_BLEEDING_END"; date: string }
  | { type: "SET_NEXT_PERIOD_START"; date: string | null }
  | { type: "CLOSE" }
  | { type: "DISMISS" }
  | { type: "RESET" };

export interface CycleFlowStore {
  state: CycleFlowState;
  dismissedCycleId: number | null;

  openForOldCycle: (params: {
    date: string;
    tappedCycleId: number;
    nextCycleId: number | null;
    seed: { periodStart: string; bleedingEnd: string; nextPeriodStart: string };
    cycleLength?: number | null;
  }) => void;
  openForCurrentCycle: (params: {
    date: string;
    cycleId: number | null;
    assumedBleedEndDate?: string | null;
  }) => void;
  openForStaleFix: (params: { cycleId: number | null; cycleLength?: number | null }) => void;

  advance: (step: CorrectionStep | CurrentCycleStep) => void;
  back: () => void;
  setDate: (date: string) => void;
  setFlowIntensity: (flowIntensity: string) => void;
  toggleMood: (mood: string) => void;
  toggleSymptom: (symptom: string) => void;
  setPeriodStart: (date: string) => void;
  setBleedingEnd: (date: string) => void;
  setNextPeriodStart: (date: string | null) => void;

  close: () => void;
  dismiss: () => void;
  reset: () => void;
}

export interface ConfirmedCycleRange {
  startDate: string;
  bleedEndDate: string;
}

export interface ConfirmedCycleState {
  ranges: Record<number, ConfirmedCycleRange>;
  setAssumedRange: (
    cycleId: number,
    startDate: string,
    bleedEndDate: string,
  ) => void;
  clearAssumedRange: (cycleId: number) => void;
}

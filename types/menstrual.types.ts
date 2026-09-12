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

export type PeriodCheckInStep =
  | "quick-check-in"
  | "not-yet"
  | "end-date"
  | "flow-intensity"
  | "symptoms"
  | "confirmation";

export interface PeriodCheckInState {
  date: string;
  cycleId: number | null;
  assumedBleedEndDate: string | null;
  flowIntensity: string | null;
  moods: string[];
  symptoms: string[];
  step: PeriodCheckInStep | null;
  start: (params: {
    date: string;
    cycleId: number | null;
    assumedBleedEndDate?: string | null;
    step: PeriodCheckInStep;
  }) => void;
  setStep: (step: PeriodCheckInStep) => void;
  setDate: (date: string) => void;
  setFlowIntensity: (flowIntensity: string) => void;
  toggleMood: (mood: string) => void;
  toggleSymptom: (symptom: string) => void;
  close: () => void;
  reset: () => void;
}

export type FixCycleStep =
  | "intro"
  | "period-start"
  | "bleeding-end"
  | "next-period-start"
  | "summary"
  | "success";

export interface FixCycleState {
  step: FixCycleStep | null;
  cycleId: number | null;
  periodStart: string;
  bleedingEnd: string;
  nextPeriodStart: string;
  dismissedCycleId: number | null;
  start: (params: { cycleId: number | null }) => void;
  setStep: (step: FixCycleStep) => void;
  setPeriodStart: (date: string) => void;
  setBleedingEnd: (date: string) => void;
  setNextPeriodStart: (date: string) => void;
  dismiss: () => void;
  close: () => void;
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

export interface FormattedMenstrualProfileInfo {
  status: string;
  pregnancyProbability: string;
  cycleLength: number;
  periodLength: number;
  whenPeriodStartedInDays: number;
}

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
    current_phase: string;
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
export interface GenerateDaysProps {
  startDate: Date | string;
  endDate: Date | string;
  colorCode: string;
  category: "MENSTRUAL" | "NORMAL" | "OVULATION";
  customProps?: {};
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

import { Control, FieldErrors } from "react-hook-form";

interface FormValues {
  cycle_length: number;
  period_length: number;
  cycle_pattern?: boolean;
  last_period_start: Date;
  notification_pref?: number;
}

export interface QuestionProps {
  control: Control<FormValues>;
  errors?: FieldErrors<FormValues>;
}

export interface QuestionHeaderProps {
  mainText: string;
  subText: string;
}

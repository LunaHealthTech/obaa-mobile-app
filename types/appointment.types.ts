import type { Party } from "./call.types";

export type Concern =
  | "PREGNANCY_SUPPORT"
  | "MISSED_PERIOD"
  | "MENSTRUAL_CONCERNS"
  | "TEEN_HEALTH"
  | "SYMPTOMS"
  | "EMOTIONAL_SUPPORT";

export type ConsultationType = "CHAT" | "AUDIO" | "VIDEO";

export type AppointmentStatus =
  | "PENDING_MATCH"
  | "MATCHED"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "EXPIRED"
  | "MIDWIFE_NO_SHOW"
  | "PATIENT_NO_SHOW"
  | "REFUNDED";

export type PaymentMethod = "MOMO" | "CARD";

export type AppointmentScope = "upcoming" | "past";

export interface MidwifeSummary {
  id: number;
  display_name: string;
  // Relative media path (e.g. "/media/..."); prefix with apiOrigin.
  profile_pic: string | null;
  credential: string;
  years_of_experience: number;
  verified: boolean;
  specialties: { code: Concern; label: string }[];
  languages: string[];
}

export interface MidwifeListItem extends MidwifeSummary {
  consultation_types: {
    type: ConsultationType;
    label: string;
    duration_minutes: number;
  }[];
  next_available_start: string | null;
  is_available_today: boolean;
}

export interface MidwifeDetail extends MidwifeListItem {
  bio: string;
  education: string;
  consultations_count: number;
  satisfaction_rate: number | null;
}

export interface Slot {
  start: string;
  available: boolean;
}

export interface Appointment {
  id: number;
  patient: Party;
  midwife: MidwifeSummary | null;
  concern: Concern;
  concern_label: string;
  consultation_type: ConsultationType;
  consultation_type_label: string;
  duration_minutes: number;
  fee: { amount: string; currency: string };
  refund: { amount: string; currency: string; created_at: string } | null;
  status: AppointmentStatus;
  status_label: string;
  scheduled_start: string;
  scheduled_end: string;
  hold_expires_at: string | null;
  notes: string;
  connection_id: number | null;
  call_opens_at: string | null;
  // room_id of a call that is ringing or in progress.
  active_call: string | null;
  patient_join_attempted_at: string | null;
  midwife_join_attempted_at: string | null;
  created_at: string;
}

export interface MidwifeQuery {
  q?: string;
  concern?: Concern;
  available_today?: "true";
}

export type SlotQuery = {
  date: string;
  consultation_type: ConsultationType;
} & ({ concern: Concern; midwife_id?: never } | { midwife_id: number; concern?: never });

export interface BookingRequest {
  concern: Concern;
  consultation_type: ConsultationType;
  scheduled_start: string;
  notes?: string;
  midwife_id?: number;
}

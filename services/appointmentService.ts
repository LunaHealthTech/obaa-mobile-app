import { apiClient } from "@/lib/apiClient";
import type {
  Appointment,
  AppointmentScope,
  BookingRequest,
  MidwifeDetail,
  MidwifeListItem,
  MidwifeQuery,
  PaymentMethod,
  Slot,
  SlotQuery,
} from "@/types/appointment.types";

export async function getMidwives(params: MidwifeQuery) {
  const res = await apiClient.get<MidwifeListItem[]>("/appointments/midwives/", { params });
  return res.data;
}

export async function getMidwife(id: number) {
  const res = await apiClient.get<MidwifeDetail>(`/appointments/midwives/${id}/`);
  return res.data;
}

export async function getSlots(params: SlotQuery) {
  const res = await apiClient.get<Slot[]>("/appointments/slots/", { params });
  return res.data;
}

export async function bookAppointment(payload: BookingRequest) {
  const res = await apiClient.post<Appointment>("/appointments/", payload);
  return res.data;
}

export async function getAppointments(scope: AppointmentScope) {
  const res = await apiClient.get<Appointment[]>("/appointments/", { params: { scope } });
  return res.data;
}

export async function getAppointment(id: number) {
  const res = await apiClient.get<Appointment>(`/appointments/${id}/`);
  return res.data;
}

export async function confirmAppointment(id: number, payment_method: PaymentMethod) {
  const res = await apiClient.post<Appointment>(`/appointments/${id}/confirm/`, { payment_method });
  return res.data;
}

export async function cancelAppointment(id: number) {
  const res = await apiClient.post<Appointment>(`/appointments/${id}/cancel/`);
  return res.data;
}

export async function refundAppointment(id: number) {
  const res = await apiClient.post<Appointment>(`/appointments/${id}/refund/`);
  return res.data;
}

export async function rescheduleAppointment(id: number, scheduled_start: string) {
  const res = await apiClient.post<Appointment>(`/appointments/${id}/reschedule/`, { scheduled_start });
  return res.data;
}

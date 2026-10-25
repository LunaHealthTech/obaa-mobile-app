import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { toast } from "sonner-native";
import { queryClient } from "@/lib/queryClient";
import { extractErrorCode, extractErrorMessage } from "@/lib/apiClient";
import { bookingErrorAction } from "@/lib/appointments/errors";
import {
  bookAppointment,
  cancelAppointment,
  confirmAppointment,
  getAppointment,
  getAppointments,
  getMidwife,
  getMidwives,
  getSlots,
  refundAppointment,
  rescheduleAppointment,
} from "@/services/appointmentService";
import type {
  Appointment,
  AppointmentScope,
  BookingRequest,
  MidwifeQuery,
  PaymentMethod,
  SlotQuery,
} from "@/types/appointment.types";

const APPOINTMENTS = "/appointments/";
const appointmentKey = (id: number) => [APPOINTMENTS, id] as const;
const listKey = (scope: AppointmentScope) => [APPOINTMENTS, "list", scope] as const;

const POLL_INTERVAL_MS = 2000;

function storeAppointment(appointment: Appointment) {
  queryClient.setQueryData(appointmentKey(appointment.id), appointment);
  return queryClient.invalidateQueries({ queryKey: [APPOINTMENTS, "list"] });
}

function refreshAppointment(id: number) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: appointmentKey(id) }),
    queryClient.invalidateQueries({ queryKey: [APPOINTMENTS, "list"] }),
  ]);
}

export function fetchFreshAppointment(id: number) {
  return queryClient.fetchQuery({
    queryKey: appointmentKey(id),
    queryFn: () => getAppointment(id),
    staleTime: 0,
  });
}

export function refetchAppointments() {
  return queryClient.invalidateQueries({ queryKey: [APPOINTMENTS] });
}

export function receiveAppointmentMatched(data: unknown) {
  const appointment = data as Partial<Appointment> | null;
  if (typeof appointment?.id !== "number" || typeof appointment.status !== "string") return;
  storeAppointment(appointment as Appointment);
}

export function receiveAppointmentClosed(data: unknown) {
  const id = (data as { id?: unknown } | null)?.id;
  if (typeof id === "number") refreshAppointment(id);
}

export function useMidwives(params: MidwifeQuery) {
  return useQuery({
    queryKey: ["/appointments/midwives/", params],
    queryFn: () => getMidwives(params),
  });
}

export function useMidwife(id: number) {
  return useQuery({
    queryKey: ["/appointments/midwives/", id],
    queryFn: () => getMidwife(id),
    enabled: Number.isInteger(id),
  });
}

export function reactToBookingError(error: unknown, fallback: string) {
  const action = bookingErrorAction(
    extractErrorCode(error),
    extractErrorMessage(error, fallback),
  );
  if (action.kind === "has-active-appointment") {
    toast.error(action.message, {
      action: {
        label: "My consultations",
        onClick: () => router.push("/consult/consultations"),
      },
    });
  } else {
    toast.error(action.message);
  }
  if (action.kind === "refresh-slots") refetchSlots();
  return action;
}

export function isMidwifeGone(error: unknown) {
  return extractErrorCode(error) === "appointment/midwife-not-found";
}

export function forgetMidwives() {
  return queryClient.invalidateQueries({ queryKey: ["/appointments/midwives/"] });
}

export function refetchSlots() {
  return queryClient.invalidateQueries({ queryKey: ["/appointments/slots/"] });
}

export function useSlots(params: SlotQuery | null) {
  return useQuery({
    queryKey: ["/appointments/slots/", params],
    queryFn: () => getSlots(params!),
    enabled: params !== null,
    staleTime: 0,
  });
}

export function useAppointment(id: number, { poll = false } = {}) {
  return useQuery({
    queryKey: appointmentKey(id),
    queryFn: () => getAppointment(id),
    enabled: Number.isInteger(id),
    refetchInterval: (query) =>
      poll && query.state.data?.status === "PENDING_MATCH" ? POLL_INTERVAL_MS : false,
  });
}

export function useAppointments(scope: AppointmentScope) {
  return useQuery({
    queryKey: listKey(scope),
    queryFn: () => getAppointments(scope),
  });
}

export function useBookAppointment() {
  return useMutation({
    mutationFn: (payload: BookingRequest) => bookAppointment(payload),
    onSuccess: storeAppointment,
  });
}

export function useConfirmAppointment(id: number) {
  return useMutation({
    mutationFn: (method: PaymentMethod) => confirmAppointment(id, method),
    onSuccess: storeAppointment,
  });
}

export function useCancelAppointment(id: number) {
  return useMutation({
    mutationFn: () => cancelAppointment(id),
    onSuccess: storeAppointment,
  });
}

export function useRefundAppointment(id: number) {
  return useMutation({
    mutationFn: () => refundAppointment(id),
    onSuccess: storeAppointment,
  });
}

export function useRescheduleAppointment(id: number) {
  return useMutation({
    mutationFn: (scheduledStart: string) => rescheduleAppointment(id, scheduledStart),
    onSuccess: storeAppointment,
    onError: () => refreshAppointment(id),
  });
}

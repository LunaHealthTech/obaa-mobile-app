import { addDays, format, isSameDay } from "date-fns";
import type { Appointment } from "../../types/appointment.types";

export function nextAvailableLabel(iso: string | null, now: Date): string {
  if (!iso) return "No availability";
  const start = new Date(iso);
  const time = format(start, "h:mm a");
  if (isSameDay(start, now)) return `${time} Today`;
  if (isSameDay(start, addDays(now, 1))) return `${time} Tomorrow`;
  return `${format(start, "EEE")} ${time}`;
}

export function timeRange(startIso: string, endIso: string): string {
  return `${format(new Date(startIso), "h:mm a")} - ${format(new Date(endIso), "h:mm a")}`;
}

export function longDate(iso: string): string {
  return format(new Date(iso), "EEEE, d MMMM yyyy");
}

export function formatFee(fee: Appointment["fee"]): string {
  return `${fee.currency} ${fee.amount}`;
}

export function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

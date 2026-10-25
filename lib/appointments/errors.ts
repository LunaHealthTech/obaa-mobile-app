export type BookingErrorAction =
  | { kind: "refresh-slots"; message: string }
  | { kind: "hold-expired"; message: string }
  | { kind: "retry"; message: string }
  | { kind: "has-active-appointment"; message: string }
  | { kind: "show"; message: string };

export function bookingErrorAction(
  code: string | null,
  message: string,
): BookingErrorAction {
  switch (code) {
    case "appointment/slot-unavailable":
      return { kind: "refresh-slots", message };
    case "appointment/invalid-status":
      return { kind: "hold-expired", message };
    case "payment/failed":
      return { kind: "retry", message };
    case "invalid-value":
      return /active appointment/i.test(message)
        ? { kind: "has-active-appointment", message }
        : { kind: "show", message };
    default:
      return { kind: "show", message };
  }
}

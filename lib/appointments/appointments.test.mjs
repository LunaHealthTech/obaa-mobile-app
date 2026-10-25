import { test } from "node:test";
import assert from "node:assert/strict";
import {
  appointmentStatus,
  canCancel,
  canRebookFree,
  closedStatusMessage,
  holdSecondsLeft,
  routeForAppointment,
  statusInfo,
} from "./status.ts";
import { formatCountdown, formatFee, nextAvailableLabel, timeRange } from "./format.ts";
import { bookingErrorAction } from "./errors.ts";
import { midwifeFilters, midwifeQuery } from "./filters.ts";

const now = new Date("2026-10-19T10:00:00Z");
const appt = (overrides = {}) => ({
  id: 7,
  status: "MATCHED",
  hold_expires_at: "2026-10-19T10:15:00Z",
  scheduled_start: "2026-10-19T14:00:00Z",
  ...overrides,
});

test("a pending booking routes to the finding-midwife screen", () => {
  assert.deepEqual(routeForAppointment(appt({ status: "PENDING_MATCH", hold_expires_at: null }), now), {
    pathname: "/consult/finding-midwife",
    params: { appointmentId: "7" },
  });
});

test("a matched booking inside its hold routes to the match screen", () => {
  assert.equal(routeForAppointment(appt(), now).pathname, "/consult/midwife-match");
});

test("a matched booking whose hold ran out routes to the appointment screen", () => {
  const expired = appt({ hold_expires_at: "2026-10-19T09:59:00Z" });
  assert.equal(routeForAppointment(expired, now).pathname, "/consult/appointment");
});

test("confirmed, completed, cancelled and expired bookings open the appointment screen", () => {
  for (const status of ["CONFIRMED", "COMPLETED", "CANCELLED", "EXPIRED"]) {
    assert.equal(routeForAppointment(appt({ status }), now).pathname, "/consult/appointment", status);
  }
});

test("every status has a chip label", () => {
  assert.equal(appointmentStatus.MATCHED.chip, "Awaiting payment");
  for (const [status, info] of Object.entries(appointmentStatus)) {
    assert.ok(info.chip.length > 0, status);
  }
});

test("hold seconds count down while matched and are zero otherwise", () => {
  assert.equal(holdSecondsLeft(appt(), now), 900);
  assert.equal(holdSecondsLeft(appt({ status: "CONFIRMED" }), now), 0);
  assert.equal(holdSecondsLeft(appt({ hold_expires_at: "2026-10-19T09:00:00Z" }), now), 0);
  assert.equal(formatCountdown(872), "14:32");
});

test("only matched or confirmed bookings before their start can be cancelled", () => {
  assert.equal(canCancel(appt(), now), true);
  assert.equal(canCancel(appt({ status: "CONFIRMED" }), now), true);
  assert.equal(canCancel(appt({ status: "PENDING_MATCH" }), now), false);
  assert.equal(canCancel(appt({ status: "CONFIRMED", scheduled_start: "2026-10-19T09:00:00Z" }), now), false);
});

test("next availability reads as today, tomorrow, a weekday, or none", () => {
  const local = new Date(2026, 9, 19, 8, 0);
  assert.equal(nextAvailableLabel(new Date(2026, 9, 19, 10, 0).toISOString(), local), "10:00 AM Today");
  assert.equal(nextAvailableLabel(new Date(2026, 9, 20, 9, 0).toISOString(), local), "9:00 AM Tomorrow");
  assert.equal(nextAvailableLabel(new Date(2026, 9, 22, 14, 0).toISOString(), local), "Thu 2:00 PM");
  assert.equal(nextAvailableLabel(null, local), "No availability");
});

test("times and fees format from the API values", () => {
  const start = new Date(2026, 9, 19, 9, 0).toISOString();
  const end = new Date(2026, 9, 19, 9, 45).toISOString();
  assert.equal(timeRange(start, end), "9:00 AM - 9:45 AM");
  assert.equal(formatFee({ amount: "50.00", currency: "GHS" }), "GHS 50.00");
});

test("booking errors map to the reaction the screen needs", () => {
  assert.equal(bookingErrorAction("appointment/slot-unavailable", "m").kind, "refresh-slots");
  assert.equal(bookingErrorAction("appointment/invalid-status", "m").kind, "hold-expired");
  assert.equal(bookingErrorAction("payment/failed", "m").kind, "retry");
  assert.equal(
    bookingErrorAction("invalid-value", "You already have an active appointment").kind,
    "has-active-appointment",
  );
  assert.equal(bookingErrorAction("invalid-value", "Date must be between ...").kind, "show");
  assert.deepEqual(bookingErrorAction("invalid", "This field is required."), {
    kind: "show",
    message: "This field is required.",
  });
  assert.equal(bookingErrorAction(null, "Can't reach the server").kind, "show");
});

test("midwife filters and search become API query params", () => {
  assert.deepEqual(midwifeFilters.map((f) => f.label), ["All", "Available Today", "Pregnancy", "Menstrual Health"]);
  assert.deepEqual(midwifeQuery("All", ""), {});
  assert.deepEqual(midwifeQuery("Available Today", "  "), { available_today: "true" });
  assert.deepEqual(midwifeQuery("Pregnancy", " efua "), { concern: "PREGNANCY_SUPPORT", q: "efua" });
  assert.deepEqual(midwifeQuery("Menstrual Health", ""), { concern: "MENSTRUAL_CONCERNS" });
});

test("no-shows get their own chips, and a midwife no-show is flagged", () => {
  assert.deepEqual(statusInfo("MIDWIFE_NO_SHOW"), { chip: "Missed by midwife", screen: "appointment", tone: "alert" });
  assert.equal(statusInfo("PATIENT_NO_SHOW").chip, "Missed by patient");
  assert.equal(statusInfo("REFUNDED").chip, "Refunded");
});

test("a status the app doesn't know yet shows the server's label instead of crashing", () => {
  assert.deepEqual(statusInfo("ON_HOLD", "On hold"), { chip: "On hold", screen: "appointment", tone: "ended" });
  assert.equal(statusInfo("ON_HOLD").chip, "ON_HOLD");
  assert.equal(routeForAppointment(appt({ status: "ON_HOLD", hold_expires_at: null }), now).pathname, "/consult/appointment");
});

test("a no-show opens the appointment screen", () => {
  assert.equal(routeForAppointment(appt({ status: "MIDWIFE_NO_SHOW", hold_expires_at: null }), now).pathname, "/consult/appointment");
});

test("only the patient can rebook free, and only after the midwife missed it", () => {
  assert.equal(canRebookFree({ status: "MIDWIFE_NO_SHOW" }, "PATIENT"), true);
  assert.equal(canRebookFree({ status: "MIDWIFE_NO_SHOW" }, "MIDWIFE"), false);
  assert.equal(canRebookFree({ status: "PATIENT_NO_SHOW" }, "PATIENT"), false);
  assert.equal(canRebookFree({ status: "COMPLETED" }, "PATIENT"), false);
});
test("closed appointments explain what happened to the money", () => {
  const fee = { amount: "50.00", currency: "GHS" };
  const refund = (amount) => ({ amount, currency: "GHS", created_at: "2026-10-19T16:00:00Z" });
  assert.equal(
    closedStatusMessage({ status: "PATIENT_NO_SHOW", status_label: "Missed", fee, refund: refund("35.00") }),
    "You didn't join this consultation. GHS 35.00 was refunded and GHS 15.00 was kept as the missed-session fee.",
  );
  assert.equal(
    closedStatusMessage({ status: "PATIENT_NO_SHOW", status_label: "Missed", fee, refund: null }),
    "You didn't join this consultation. Your partial refund is on its way.",
  );
  assert.equal(
    closedStatusMessage({ status: "REFUNDED", status_label: "Refunded", fee, refund: refund("50.00") }),
    "Your midwife missed this consultation. GHS 50.00 was refunded in full.",
  );
  assert.equal(closedStatusMessage({ status: "COMPLETED", status_label: "Completed", fee, refund: null }), "Status: Completed");
});
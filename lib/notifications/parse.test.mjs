import { test } from "node:test";
import assert from "node:assert/strict";
import { parseNotification, parseNotificationsResponse } from "./parse.ts";

const dto = (overrides = {}) => ({
  id: 1,
  kind: "LATE_PERIOD",
  severity: "URGENT",
  title: "Your period is 9 days late",
  body: "Body text.",
  action: "BOOK_CONSULTATION",
  action_payload: { concern: "MISSED_PERIOD" },
  read_at: null,
  created_at: "2026-10-01T00:00:00Z",
  ...overrides,
});

test("a known notification parses with severity and a booking CTA", () => {
  const n = parseNotification(dto());
  assert.equal(n.severity, "URGENT");
  assert.deepEqual(n.cta, { kind: "BOOK_CONSULTATION", concern: "MISSED_PERIOD" });
  assert.equal(n.title, "Your period is 9 days late");
});

test("unknown kind, severity and action still parse, with neutral severity and no CTA", () => {
  const n = parseNotification(
    dto({ kind: "SOMETHING_NEW", severity: "CRITICAL", action: "OPEN_ARTICLE" }),
  );
  assert.equal(n.kind, "SOMETHING_NEW");
  assert.equal(n.severity, null);
  assert.equal(n.cta, null);
  assert.equal(n.title, "Your period is 9 days late");
});

test("a booking action with an unknown or missing concern has no CTA", () => {
  assert.equal(parseNotification(dto({ action_payload: { concern: "NOT_A_CONCERN" } })).cta, null);
  assert.equal(parseNotification(dto({ action_payload: null })).cta, null);
});

test("an appointment reminder parses to an OPEN_APPOINTMENT CTA", () => {
  const n = parseNotification(
    dto({
      kind: "APPOINTMENT_REMINDER",
      severity: "INFO",
      action: "OPEN_APPOINTMENT",
      action_payload: { appointment_id: 42 },
    }),
  );
  assert.deepEqual(n.cta, { kind: "OPEN_APPOINTMENT", appointmentId: 42 });
});

test("an OPEN_APPOINTMENT without a numeric id has no CTA", () => {
  assert.equal(
    parseNotification(dto({ action: "OPEN_APPOINTMENT", action_payload: { appointment_id: "42" } })).cta,
    null,
  );
});

test("the list response maps unread_count and keeps server order", () => {
  const state = parseNotificationsResponse({
    unread_count: 2,
    results: [dto({ id: 2 }), dto({ id: 1 })],
  });
  assert.equal(state.unreadCount, 2);
  assert.deepEqual(state.results.map((n) => n.id), [2, 1]);
});

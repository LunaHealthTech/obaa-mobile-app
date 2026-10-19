import { test } from "node:test";
import assert from "node:assert/strict";
import { ctaHref, ctaLabel } from "./cta.ts";
import { concernLabel, concernOptions, parseConcern } from "../appointments/concerns.ts";

test("the booking CTA opens match preferences with the concern as a param", () => {
  const cta = { kind: "BOOK_CONSULTATION", concern: "MISSED_PERIOD" };
  assert.deepEqual(ctaHref(cta, "PATIENT"), {
    pathname: "/consult/match-preferences",
    params: { concern: "MISSED_PERIOD" },
  });
  assert.equal(ctaLabel(cta), "Book a consultation");
});

test("the appointment CTA opens that appointment on the reader's own side of the app", () => {
  const cta = { kind: "OPEN_APPOINTMENT", appointmentId: 42 };
  assert.deepEqual(ctaHref(cta, "PATIENT"), {
    pathname: "/consult/appointment",
    params: { appointmentId: "42" },
  });
  assert.deepEqual(ctaHref(cta, "MIDWIFE"), {
    pathname: "/midwife/appointment",
    params: { appointmentId: "42" },
  });
  assert.equal(ctaLabel(cta), "View appointment");
});

test("every concern the backend uses is a selectable option", () => {
  assert.deepEqual(
    concernOptions.map((c) => c.code),
    ["PREGNANCY_SUPPORT", "MISSED_PERIOD", "MENSTRUAL_CONCERNS", "TEEN_HEALTH", "SYMPTOMS", "EMOTIONAL_SUPPORT"],
  );
  assert.equal(parseConcern("MENSTRUAL_CONCERNS"), "MENSTRUAL_CONCERNS");
});

test("a booking shows the topic the patient picked, not the API's grouped label", () => {
  assert.equal(concernLabel("MISSED_PERIOD"), "Missed Period");
  assert.equal(concernLabel("MENSTRUAL_CONCERNS"), "Menstrual Concerns");
});

test("an unknown or missing concern deep link preselects nothing", () => {
  assert.equal(parseConcern("NOT_A_CONCERN"), null);
  assert.equal(parseConcern("toString"), null);
  assert.equal(parseConcern(undefined), null);
});

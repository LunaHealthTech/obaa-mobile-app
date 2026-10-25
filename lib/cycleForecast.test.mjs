import { test } from "node:test";
import assert from "node:assert/strict";
import { cycleRing, nextOvulation, ovulationLabel, pregnancyChance } from "./cycleForecast.ts";

const today = new Date(2026, 9, 19, 15, 30);
const current = { start_date: "2026-10-10", ovulation_day: "2026-10-24" };
const projected = { start_date: "2026-11-07", ovulation_day: "2026-11-21" };

test("counts calendar days to the next ovulation in the current cycle", () => {
  assert.deepEqual(nextOvulation(today, [projected, current]), { date: "2026-10-24", daysAway: 5 });
});

test("ovulation today reads as Today, not yesterday's leftover hours", () => {
  const onTheDay = nextOvulation(today, [{ start_date: "2026-10-05", ovulation_day: "2026-10-19" }]);
  assert.equal(onTheDay.daysAway, 0);
  assert.equal(ovulationLabel(onTheDay.daysAway), "Today");
  assert.equal(ovulationLabel(1), "Tomorrow");
  assert.equal(ovulationLabel(12), "12 Days");
});

test("once this cycle's ovulation has passed, it counts to the projected cycle's", () => {
  const passed = { start_date: "2026-09-28", ovulation_day: "2026-10-12" };
  assert.deepEqual(nextOvulation(today, [passed, projected]), { date: "2026-11-21", daysAway: 33 });
});

test("no cycles means no forecast", () => {
  assert.equal(nextOvulation(today, []), null);
  assert.equal(pregnancyChance(today, []), null);
  assert.equal(pregnancyChance(today, [{ start_date: "2026-10-10", ovulation_day: null }]), null);
});

test("pregnancy chance follows the backend's bands around the owning cycle's ovulation", () => {
  const withOvulationIn = (days) => {
    const ov = new Date(2026, 9, 19 + days);
    const iso = `${ov.getFullYear()}-${String(ov.getMonth() + 1).padStart(2, "0")}-${String(ov.getDate()).padStart(2, "0")}`;
    return pregnancyChance(today, [{ start_date: "2026-10-01", ovulation_day: iso }]);
  };
  assert.equal(withOvulationIn(7), "Very Low");
  assert.equal(withOvulationIn(6), "High");
  assert.equal(withOvulationIn(5), "High");
  assert.equal(withOvulationIn(4), "Very High");
  assert.equal(withOvulationIn(1), "Very High");
  assert.equal(withOvulationIn(0), "High");
  assert.equal(withOvulationIn(-1), "High");
  assert.equal(withOvulationIn(-2), "Low");
});

test("an overdue cycle still gets a chance from the projected cycle that owns today", () => {
  const stale = { start_date: "2026-09-01", ovulation_day: "2026-09-15" };
  const projectedNow = { start_date: "2026-10-15", ovulation_day: "2026-10-29" };
  assert.equal(pregnancyChance(today, [stale, projectedNow]), "Very Low");
});

const realCycle = {
  id: 5,
  start_date: "2026-10-10",
  bleed_end_date: "2026-10-14",
  end_date: "2026-11-07",
  ovulation_day: "2026-10-25",
  cycle_length: 29,
};
const projectedCycle = { ...realCycle, id: null, start_date: "2026-11-08", bleed_end_date: "2026-11-12", end_date: "2026-12-06", ovulation_day: "2026-11-23" };
const on = (y, m, d) => new Date(y, m - 1, d, 21, 45);
const ringOn = (date, assumed) => cycleRing(date, [realCycle, projectedCycle], assumed);

test("the first day of a period is Day 1, counted in calendar days", () => {
  assert.deepEqual(ringOn(on(2026, 10, 10)), { day: 1, totalDays: 29, phase: "MENSTRUATING" });
  assert.equal(ringOn(on(2026, 10, 19)).day, 10);
});

test("the ring phase follows the backend's phase boundaries", () => {
  assert.equal(ringOn(on(2026, 10, 14)).phase, "MENSTRUATING");
  assert.equal(ringOn(on(2026, 10, 15)).phase, "FOLLICULAR");
  assert.equal(ringOn(on(2026, 10, 24)).phase, "FOLLICULAR");
  assert.equal(ringOn(on(2026, 10, 25)).phase, "OVULATING");
  assert.equal(ringOn(on(2026, 10, 26)).phase, "OVULATING");
  assert.equal(ringOn(on(2026, 10, 27)).phase, "LUTEAL");
  assert.equal(ringOn(on(2026, 11, 7)).phase, "LUTEAL");
});

test("a late period keeps counting on the real cycle and reads Missed, not the projection", () => {
  assert.deepEqual(ringOn(on(2026, 11, 11)), { day: 33, totalDays: 29, phase: "MISSED" });
});

test("a bleed the user confirmed locally stays menstrual until the server catches up", () => {
  assert.equal(ringOn(on(2026, 10, 16), "2026-10-17").phase, "MENSTRUATING");
  assert.equal(ringOn(on(2026, 10, 18), "2026-10-17").phase, "FOLLICULAR");
});

test("an unfinished bleed reads menstrual, and no real cycle means no ring", () => {
  assert.equal(cycleRing(on(2026, 10, 20), [{ ...realCycle, bleed_end_date: null }]).phase, "MENSTRUATING");
  assert.equal(cycleRing(on(2026, 10, 20), [projectedCycle]), null);
  assert.equal(cycleRing(on(2026, 10, 20), []), null);
});

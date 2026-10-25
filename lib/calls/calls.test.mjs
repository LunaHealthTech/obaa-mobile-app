import { test } from "node:test";
import assert from "node:assert/strict";
import { idle, reduceCall } from "./machine.ts";
import { joinState } from "./joinWindow.ts";
import { parseCall, parseCallEnd, parseCallError } from "./parse.ts";

const now = new Date("2026-10-19T10:00:00Z");
const ama = { username: "ama", display_name: "Ama", profile_pic: null, role: "PATIENT" };
const abena = { username: "abena", display_name: "Abena", profile_pic: null, role: "MIDWIFE" };

const dto = (overrides = {}) => ({
  id: 3,
  room_id: "room-1",
  appointment: 12,
  caller: ama,
  callee: abena,
  call_type: "VIDEO",
  status: "RINGING",
  ends_at: "2026-10-19T10:30:00Z",
  ...overrides,
});
const call = (overrides) => parseCall(dto(overrides));

const run = (me, ...events) => events.reduce((state, event) => reduceCall(state, event, me), idle);

test("the caller sees the outgoing screen and the callee the incoming one", () => {
  const invited = { type: "invited", call: call() };
  assert.equal(run("ama", invited).phase, "outgoing");
  assert.equal(run("abena", invited).phase, "incoming");
});

test("a call goes from ringing to connecting to in-call once media connects", () => {
  const accepted = { type: "accepted", call: call({ status: "ACCEPTED" }) };
  const state = run("ama", { type: "join", appointmentId: 12 }, { type: "invited", call: call() }, accepted);
  assert.equal(state.phase, "connecting");
  assert.equal(reduceCall(state, { type: "media-connected" }, "ama").phase, "in-call");
});

test("a second ring is ignored while already on a call", () => {
  const onCall = run("abena", { type: "invited", call: call() }, { type: "answered" });
  const other = reduceCall(onCall, { type: "invited", call: call({ room_id: "room-2", appointment: 13 }) }, "abena");
  assert.equal(other, onCall);
});

test("ending-soon warns only during the call", () => {
  const inCall = run(
    "ama",
    { type: "invited", call: call() },
    { type: "accepted", call: call({ status: "ACCEPTED" }) },
    { type: "media-connected" },
    { type: "ending-soon", roomId: "room-1" },
  );
  assert.equal(inCall.endingSoon, true);
});

test("end reasons map to messages, and only a dropped or missed call can ring again", () => {
  const end = (me, reason, status = "ENDED", at = now) =>
    run(me, { type: "invited", call: call() }, { type: "ended", roomId: "room-1", status, reason, now: at });

  assert.equal(end("ama", "hangup", "MISSED").message, "Call cancelled");
  assert.equal(end("abena", "hangup", "MISSED").message, "Ama cancelled the call");
  assert.equal(end("ama", "hangup").message, "Call ended");
  assert.equal(end("ama", "missed").message, "Abena didn't answer");
  assert.equal(end("abena", "missed").message, "You missed a call from Ama");
  assert.equal(end("ama", "appointment_ended").message, "Your appointment time is over");

  const dropped = end("ama", "peer_disconnected");
  assert.equal(dropped.message, "Abena lost connection");
  assert.equal(dropped.canRetry, true);
  assert.equal(end("ama", "peer_disconnected", "ENDED", new Date("2026-10-19T10:30:00Z")).canRetry, false);
  assert.equal(end("ama", "hangup").canRetry, false);
});

test("hanging up before an answer reads as cancelled, after one as ended", () => {
  assert.equal(run("ama", { type: "invited", call: call() }, { type: "hung-up" }).message, "Call cancelled");
  const answered = run(
    "ama",
    { type: "invited", call: call() },
    { type: "accepted", call: call({ status: "ACCEPTED" }) },
    { type: "hung-up" },
  );
  assert.equal(answered.message, "Call ended");
});

test("an end for another room is ignored", () => {
  const ringing = run("ama", { type: "invited", call: call() });
  const after = reduceCall(ringing, { type: "ended", roomId: "other", status: "ENDED", reason: "hangup", now }, "ama");
  assert.equal(after, ringing);
});

test("a decline ends the caller's call and closes the callee's screen", () => {
  const rejected = { type: "rejected", roomId: "room-1" };
  assert.equal(run("ama", { type: "invited", call: call() }, rejected).message, "Abena declined the call");
  assert.equal(run("abena", { type: "invited", call: call() }, rejected).phase, "idle");
});

test("invite errors: offline waits, busy offers a retry, window and permission errors block", () => {
  const invite = (code) =>
    run(
      "ama",
      { type: "join", appointmentId: 12 },
      { type: "error", source: "call.invite.error", error: parseCallError({ code, error: "msg" }) },
    );
  assert.deepEqual(invite("call/user-offline"), { phase: "waiting", appointmentId: 12, endsAt: null });
  assert.equal(invite("call/user-busy").message, "They are on another call");
  assert.equal(invite("call/user-busy").canRetry, true);
  for (const code of ["call/window-closed", "call/not-allowed", "call/not-participant", "appointment/not-found"]) {
    assert.deepEqual(invite(code), { phase: "blocked", appointmentId: 12, message: "msg" });
  }
  assert.equal(invite("call/already-ended").phase, "idle");
});

test("a waiting caller picks up the other side's ring", () => {
  const state = run(
    "ama",
    { type: "join", appointmentId: 12 },
    { type: "error", source: "call.invite.error", error: { code: "call/user-offline", message: "" } },
    { type: "invited", call: call({ caller: abena, callee: ama }) },
  );
  assert.equal(state.phase, "incoming");
});

test("losing the socket mid-call ends it with a retry", () => {
  const state = run("ama", { type: "invited", call: call() }, { type: "socket-closed" });
  assert.equal(state.phase, "ended");
  assert.equal(state.canRetry, true);
});

test("malformed payloads are rejected at the boundary", () => {
  assert.equal(parseCall({ ...dto(), call_type: "CHAT" }), null);
  assert.equal(parseCall(null), null);
  assert.deepEqual(parseCallEnd({ room_id: "r", status: "WAT", reason: "?" }), {
    roomId: "r",
    status: null,
    reason: null,
  });
  assert.equal(parseCallError({ code: "nope" }).code, null);
});

test("the join button unlocks at call_opens_at and closes at scheduled_end", () => {
  const appt = (overrides = {}) => ({
    status: "CONFIRMED",
    consultation_type: "VIDEO",
    call_opens_at: "2026-10-19T09:55:00Z",
    scheduled_end: "2026-10-19T10:30:00Z",
    ...overrides,
  });
  assert.deepEqual(joinState(appt({ call_opens_at: "2026-10-19T10:01:30Z" }), now), {
    kind: "locked",
    secondsUntilOpen: 90,
  });
  assert.deepEqual(joinState(appt(), now), { kind: "open" });
  assert.deepEqual(joinState(appt({ scheduled_end: "2026-10-19T10:00:00Z" }), now), { kind: "closed" });
  assert.deepEqual(joinState(appt({ consultation_type: "CHAT", call_opens_at: null }), now), { kind: "hidden" });
  assert.deepEqual(joinState(appt({ status: "MATCHED" }), now), { kind: "hidden" });
});

const offline = { type: "error", source: "call.invite.error", error: { code: "call/user-offline", message: "" } };
const loaded = { type: "appointment-loaded", appointmentId: 12, endsAt: "2026-10-19T10:30:00Z" };

test("the waiting screen knows when the appointment ends", () => {
  const waiting = run("ama", { type: "join", appointmentId: 12 }, loaded, offline);
  assert.deepEqual(waiting, { phase: "waiting", appointmentId: 12, endsAt: "2026-10-19T10:30:00Z" });
});

test("waiting past the end time closes with a no-show message naming who didn't join", () => {
  const ended = (me, peerRole) =>
    run(me, { type: "join", appointmentId: 12 }, loaded, offline, { type: "window-ended", appointmentId: 12, peerRole });
  const patientSide = ended("ama", "MIDWIFE");
  assert.equal(patientSide.phase, "ended");
  assert.equal(patientSide.message, "Your midwife didn't join before the appointment ended.");
  assert.equal(patientSide.canRetry, false);
  assert.equal(ended("abena", "PATIENT").message, "Your patient didn't join before the appointment ended.");
});

test("the end-time deadline is ignored once a ring arrives, or for another appointment", () => {
  const ringing = run("ama", { type: "join", appointmentId: 12 }, loaded, offline, {
    type: "invited",
    call: call({ caller: abena, callee: ama }),
  });
  const late = reduceCall(ringing, { type: "window-ended", appointmentId: 12, peerRole: "MIDWIFE" }, "ama");
  assert.equal(late, ringing);

  const waiting = run("ama", { type: "join", appointmentId: 12 }, loaded, offline);
  assert.equal(reduceCall(waiting, { type: "window-ended", appointmentId: 99, peerRole: "MIDWIFE" }, "ama"), waiting);
});

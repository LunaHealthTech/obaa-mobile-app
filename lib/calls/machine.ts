import type {
  Call,
  CallError,
  CallStatus,
  CallType,
  EndReason,
  Party,
  Role,
} from "../../types/call.types";
import { otherParty, roleNoun } from "./parties.ts";

export type CallState =
  | { phase: "idle" }
  | { phase: "preparing"; appointmentId: number; endsAt: string | null }
  | { phase: "waiting"; appointmentId: number; endsAt: string | null }
  | { phase: "outgoing"; call: Call }
  | { phase: "incoming"; call: Call }
  | { phase: "connecting"; call: Call }
  | { phase: "in-call"; call: Call; endingSoon: boolean }
  | {
      phase: "ended";
      appointmentId: number;
      roomId: string | null;
      peer: Party | null;
      callType: CallType | null;
      message: string;
      canRetry: boolean;
    }
  | { phase: "blocked"; appointmentId: number; message: string };

export type CallEvent =
  | { type: "join"; appointmentId: number }
  | { type: "appointment-loaded"; appointmentId: number; endsAt: string }
  | { type: "window-ended"; appointmentId: number; peerRole: Role }
  | { type: "invited"; call: Call }
  | { type: "answered" }
  | { type: "accepted"; call: Call }
  | { type: "media-connected" }
  | { type: "rejected"; roomId: string }
  | { type: "ending-soon"; roomId: string }
  | {
      type: "ended";
      roomId: string;
      status: CallStatus | null;
      reason: EndReason | null;
      now: Date;
    }
  | { type: "hung-up" }
  | { type: "declined" }
  | { type: "error"; source: string; error: CallError }
  | { type: "failed"; message: string }
  | { type: "socket-closed" }
  | { type: "dismiss" };

export const idle: CallState = { phase: "idle" };

export const callOf = (state: CallState): Call | null =>
  "call" in state ? state.call : null;

export function appointmentOf(state: CallState): number | null {
  if ("call" in state) return state.call.appointmentId;
  return "appointmentId" in state ? state.appointmentId : null;
}

// Phases in which the user is on, or about to be on, a call. A new ring
// arriving for another appointment is ignored while one of these is live.
const busyPhases = new Set<CallState["phase"]>(["outgoing", "incoming", "connecting", "in-call"]);
export const isOnCall = (state: CallState) => busyPhases.has(state.phase);

function ended(
  call: Call,
  me: string,
  message: string,
  canRetry: boolean,
): CallState {
  return {
    phase: "ended",
    appointmentId: call.appointmentId,
    roomId: call.roomId,
    peer: otherParty(call, me),
    callType: call.callType,
    message,
    canRetry,
  };
}

export function endMessage(
  call: Call,
  me: string,
  status: CallStatus | null,
  reason: EndReason | null,
): string {
  const peer = otherParty(call, me).display_name;
  const iCalled = call.caller.username === me;
  switch (reason) {
    case "missed":
      return iCalled ? `${peer} didn't answer` : `You missed a call from ${peer}`;
    case "appointment_ended":
      return "Your appointment time is over";
    case "peer_disconnected":
      return `${peer} lost connection`;
    default:
      if (status === "MISSED") {
        return iCalled ? "Call cancelled" : `${peer} cancelled the call`;
      }
      return "Call ended";
  }
}

function canRingAgain(call: Call, reason: EndReason | null, now: Date) {
  return (
    (reason === "peer_disconnected" || reason === "missed") &&
    now.getTime() < new Date(call.endsAt).getTime()
  );
}

const blockingCodes = new Set([
  "call/window-closed",
  "call/not-allowed",
  "call/not-participant",
  "call/not-found",
  "appointment/not-found",
]);

function reduceError(
  state: CallState,
  source: string,
  error: CallError,
  me: string,
): CallState {
  if (error.code === "call/already-ended") return idle;
  const appointmentId = appointmentOf(state);
  if (appointmentId === null) return state;

  if (source === "call.invite.error") {
    if (error.code === "call/user-offline") {
      const endsAt = state.phase === "preparing" || state.phase === "waiting" ? state.endsAt : null;
      return { phase: "waiting", appointmentId, endsAt };
    }
    if (error.code === "call/user-busy") {
      return {
        phase: "ended",
        appointmentId,
        roomId: null,
        peer: null,
        callType: null,
        message: "They are on another call",
        canRetry: true,
      };
    }
  }
  if (error.code && blockingCodes.has(error.code)) {
    return { phase: "blocked", appointmentId, message: error.message };
  }
  const call = callOf(state);
  return call
    ? ended(call, me, error.message, true)
    : { phase: "blocked", appointmentId, message: error.message };
}

export function reduceCall(state: CallState, event: CallEvent, me: string): CallState {
  const call = callOf(state);
  const sameRoom = (roomId: string) => call?.roomId === roomId;

  switch (event.type) {
    case "join":
      return isOnCall(state)
        ? state
        : { phase: "preparing", appointmentId: event.appointmentId, endsAt: null };

    case "appointment-loaded":
      return state.phase === "preparing" && state.appointmentId === event.appointmentId
        ? { ...state, endsAt: event.endsAt }
        : state;

    case "window-ended":
      if (
        (state.phase !== "preparing" && state.phase !== "waiting") ||
        state.appointmentId !== event.appointmentId
      ) {
        return state;
      }
      return {
        phase: "ended",
        appointmentId: state.appointmentId,
        roomId: null,
        peer: null,
        callType: null,
        message: `Your ${roleNoun(event.peerRole)} didn't join before the appointment ended.`,
        canRetry: false,
      };

    case "invited": {
      if (isOnCall(state) && !sameRoom(event.call.roomId)) return state;
      return event.call.caller.username === me
        ? { phase: "outgoing", call: event.call }
        : { phase: "incoming", call: event.call };
    }

    case "answered":
      return state.phase === "incoming" ? { phase: "connecting", call: state.call } : state;

    case "accepted":
      if (!sameRoom(event.call.roomId)) return state;
      return state.phase === "outgoing" || state.phase === "incoming"
        ? { phase: "connecting", call: event.call }
        : state;

    case "media-connected":
      return state.phase === "connecting"
        ? { phase: "in-call", call: state.call, endingSoon: false }
        : state;

    case "rejected":
      if (!call || !sameRoom(event.roomId)) return state;
      return call.caller.username === me
        ? ended(call, me, `${otherParty(call, me).display_name} declined the call`, false)
        : idle;

    case "ending-soon":
      if (!sameRoom(event.roomId)) return state;
      return state.phase === "in-call" ? { ...state, endingSoon: true } : state;

    case "ended":
      if (!call || !sameRoom(event.roomId)) return state;
      return ended(
        call,
        me,
        endMessage(call, me, event.status, event.reason),
        canRingAgain(call, event.reason, event.now),
      );

    case "hung-up":
      if (!call) return idle;
      return ended(call, me, state.phase === "outgoing" ? "Call cancelled" : "Call ended", false);

    case "declined":
      return state.phase === "incoming" ? idle : state;

    case "error":
      return reduceError(state, event.source, event.error, me);

    case "failed": {
      const appointmentId = appointmentOf(state);
      if (appointmentId === null) return state;
      return call
        ? ended(call, me, event.message, true)
        : { phase: "blocked", appointmentId, message: event.message };
    }

    case "socket-closed":
      return call ? ended(call, me, "You lost connection", true) : state;

    case "dismiss":
      return idle;
  }
}

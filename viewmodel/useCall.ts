import { PermissionsAndroid, Platform } from "react-native";
import { create } from "zustand";
import InCallManager from "react-native-incall-manager";
import type { MediaStream } from "react-native-webrtc";
import { sendRealtime } from "@/lib/realtimeSocket";
import { extractErrorMessage } from "@/lib/apiClient";
import {
  appointmentOf,
  callOf,
  idle,
  reduceCall,
  type CallEvent,
  type CallState,
} from "@/lib/calls/machine";
import { parseCall, parseCallEnd, parseCallError, parseRoomId, parseSignal } from "@/lib/calls/parse";
import { createPeerSession, type IceCandidateJSON, type PeerSession } from "@/lib/calls/peer";
import { getRecentCalls, getTurnCredentials } from "@/services/callService";
import { useAuthStore } from "@/repositories/useAuthStore";
import { fetchFreshAppointment, refetchAppointments } from "@/viewmodel/useAppointments";
import type { CallType } from "@/types/call.types";

type CallStore = {
  state: CallState;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  muted: boolean;
  cameraOff: boolean;
  speakerOn: boolean;
};

const initialMedia = {
  localStream: null,
  remoteStream: null,
  muted: false,
  cameraOff: false,
  speakerOn: false,
};

const useCallStore = create<CallStore>(() => ({ state: idle, ...initialMedia }));

let session: PeerSession | null = null;

const me = () => useAuthStore.getState().user?.username ?? "";
const current = () => useCallStore.getState().state;

// Phases that keep the camera and mic open. Everything else releases them.
const mediaPhases = new Set<CallState["phase"]>(["preparing", "outgoing", "connecting", "in-call"]);

function dispatch(event: CallEvent) {
  const previous = current();
  const next = reduceCall(previous, event, me());
  if (next === previous) return;
  useCallStore.setState({ state: next });

  if (next.phase === "incoming" && previous.phase !== "incoming") {
    InCallManager.startRingtone("_DEFAULT_", [], "", 45);
  }
  if (previous.phase === "incoming" && next.phase !== "incoming") InCallManager.stopRingtone();
  if (!mediaPhases.has(next.phase) && !(next.phase === "incoming" && session)) closeSession();
  // The appointment's active_call changed, so lists and details are stale.
  if (callOf(previous) && !callOf(next)) refetchAppointments();
  syncWaitingDeadline(next);
}

let waitingDeadline: ReturnType<typeof setTimeout> | undefined;

// Nobody rings a user who waited past the appointment's end, so the wait
// ends itself instead of lasting forever.
function syncWaitingDeadline(state: CallState) {
  clearTimeout(waitingDeadline);
  waitingDeadline = undefined;
  if (state.phase !== "waiting" || !state.endsAt) return;
  const { appointmentId } = state;
  const peerRole = useAuthStore.getState().user?.role === "MIDWIFE" ? "PATIENT" : "MIDWIFE";
  waitingDeadline = setTimeout(
    () => dispatch({ type: "window-ended", appointmentId, peerRole }),
    Math.max(0, new Date(state.endsAt).getTime() - Date.now()),
  );
}

function closeSession() {
  session?.close();
  session = null;
  useCallStore.setState(initialMedia);
}

const PERMISSION_MESSAGE =
  "Obaa needs your microphone, and your camera for video, to connect your consultation. Allow access in your phone's Settings, then try again.";

async function hasMediaPermission(callType: CallType) {
  if (Platform.OS !== "android") return true;
  const wanted = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];
  if (callType === "VIDEO") wanted.push(PermissionsAndroid.PERMISSIONS.CAMERA);
  const result = await PermissionsAndroid.requestMultiple(wanted);
  return wanted.every((permission) => result[permission] === PermissionsAndroid.RESULTS.GRANTED);
}

// Opens the camera and mic and builds the peer connection with fresh TURN
// credentials. Returns false, with the state already explaining why, when
// the call can't go ahead.
async function openSession(callType: CallType, stillWanted: () => boolean) {
  if (session) return true;
  if (!(await hasMediaPermission(callType))) {
    dispatch({ type: "failed", message: PERMISSION_MESSAGE });
    return false;
  }
  try {
    const turn = await getTurnCredentials();
    const opened = await createPeerSession({
      turn,
      callType,
      onIceCandidate: sendCandidate,
      onRemoteStream: (remoteStream) => useCallStore.setState({ remoteStream }),
      onConnectionChange: (state) => {
        if (state === "connected") dispatch({ type: "media-connected" });
        else failCall("We couldn't connect the call");
      },
    });
    if (!stillWanted()) {
      opened.close();
      return false;
    }
    session = opened;
    useCallStore.setState({
      localStream: opened.localStream,
      speakerOn: callType === "VIDEO",
    });
    return true;
  } catch (error) {
    if (stillWanted()) {
      dispatch({
        type: "failed",
        message: extractErrorMessage(error, "We couldn't start the call. Check your connection."),
      });
    }
    return false;
  }
}

function sendCandidate(candidate: IceCandidateJSON) {
  const call = callOf(current());
  if (call) sendRealtime({ source: "call.ice-candidate", room_id: call.roomId, candidate });
}

function failCall(message: string) {
  const call = callOf(current());
  if (call) sendRealtime({ source: "call.end", room_id: call.roomId });
  dispatch({ type: "failed", message });
}

function sendOrFail(message: { source: string } & Record<string, unknown>) {
  if (sendRealtime(message)) return true;
  dispatch({ type: "failed", message: "You're offline. Check your connection and try again." });
  return false;
}

// Rings the other party, or picks up the call they already started.
export async function joinCall(appointmentId: number) {
  dispatch({ type: "join", appointmentId });
  const preparing = () => {
    const state = current();
    return state.phase === "preparing" && state.appointmentId === appointmentId;
  };
  if (!preparing()) return;

  try {
    const appointment = await fetchFreshAppointment(appointmentId);
    if (!preparing()) return;
    dispatch({ type: "appointment-loaded", appointmentId, endsAt: appointment.scheduled_end });
    if (appointment.active_call) {
      const existing = (await getRecentCalls())
        .map(parseCall)
        .find((call) => call?.roomId === appointment.active_call);
      if (!preparing()) return;
      if (existing?.status === "RINGING") {
        dispatch({ type: "invited", call: existing });
        if (existing.caller.username !== me()) return;
        await openSession(existing.callType, () => callOf(current())?.roomId === existing.roomId);
        return;
      }
      // An accepted call this device isn't part of is left over from a
      // dropped session, so it can't carry media. End it and ring fresh.
      sendRealtime({ source: "call.end", room_id: appointment.active_call });
    }
    const callType = appointment.consultation_type === "VIDEO" ? "VIDEO" : "AUDIO";
    if (!(await openSession(callType, preparing))) return;
    sendOrFail({ source: "call.invite", appointment_id: appointmentId });
  } catch (error) {
    if (preparing()) {
      dispatch({ type: "failed", message: extractErrorMessage(error, "We couldn't start the call") });
    }
  }
}

export async function acceptCall() {
  const state = current();
  if (state.phase !== "incoming") return;
  const { call } = state;
  const ringing = () => callOf(current())?.roomId === call.roomId && current().phase === "incoming";
  InCallManager.stopRingtone();
  if (!(await openSession(call.callType, ringing))) return;
  if (sendOrFail({ source: "call.accept", room_id: call.roomId })) dispatch({ type: "answered" });
}

export function declineCall() {
  const state = current();
  if (state.phase !== "incoming") return;
  sendRealtime({ source: "call.reject", room_id: state.call.roomId });
  dispatch({ type: "declined" });
}

export function hangUp() {
  const call = callOf(current());
  if (call) {
    sendRealtime({ source: "call.end", room_id: call.roomId });
    dispatch({ type: "hung-up" });
  } else {
    dispatch({ type: "dismiss" });
  }
}

export function callAgain() {
  const appointmentId = appointmentOf(current());
  if (appointmentId !== null) joinCall(appointmentId);
}

export const dismissCall = () => dispatch({ type: "dismiss" });

export function toggleMute() {
  const muted = !useCallStore.getState().muted;
  session?.setMuted(muted);
  useCallStore.setState({ muted });
}

export function toggleCamera() {
  const cameraOff = !useCallStore.getState().cameraOff;
  session?.setCameraOff(cameraOff);
  useCallStore.setState({ cameraOff });
}

export function toggleSpeaker() {
  const speakerOn = !useCallStore.getState().speakerOn;
  session?.setSpeaker(speakerOn);
  useCallStore.setState({ speakerOn });
}

async function onAccepted(data: unknown) {
  const call = parseCall(data);
  if (!call) return;
  dispatch({ type: "accepted", call });
  const state = current();
  if (state.phase !== "connecting" || state.call.roomId !== call.roomId) return;
  session?.startAudioRoute();
  if (call.caller.username !== me() || !session) return;
  try {
    const sdp = await session.createOffer();
    sendRealtime({ source: "call.offer", room_id: call.roomId, sdp });
  } catch {
    failCall("We couldn't connect the call");
  }
}

function forCurrentCall(data: unknown) {
  const signal = parseSignal(data);
  return signal && callOf(current())?.roomId === signal.roomId && session ? signal : null;
}

async function onOffer(data: unknown) {
  const signal = forCurrentCall(data);
  if (!signal?.sdp || !session) return;
  try {
    const sdp = await session.answerOffer(signal.sdp);
    sendRealtime({ source: "call.answer", room_id: signal.roomId, sdp });
  } catch {
    failCall("We couldn't connect the call");
  }
}

async function onAnswer(data: unknown) {
  const signal = forCurrentCall(data);
  if (!signal?.sdp || !session) return;
  try {
    await session.acceptAnswer(signal.sdp);
  } catch {
    failCall("We couldn't connect the call");
  }
}

function onIceCandidate(data: unknown) {
  const signal = forCurrentCall(data);
  if (signal?.candidate && session) {
    session.addCandidate(signal.candidate as IceCandidateJSON).catch(() => {});
  }
}

const errorHandler = (source: string) => (data: unknown) =>
  dispatch({ type: "error", source, error: parseCallError(data) });

export const callRealtimeHandlers: Record<string, (data: unknown) => void> = {
  "call.invite": (data) => {
    const call = parseCall(data);
    if (call) dispatch({ type: "invited", call });
  },
  "call.accept": onAccepted,
  "call.reject": (data) => {
    const roomId = parseRoomId(data);
    if (roomId) dispatch({ type: "rejected", roomId });
  },
  "call.end": (data) => {
    const end = parseCallEnd(data);
    if (end) dispatch({ type: "ended", ...end, now: new Date() });
  },
  "call.ending-soon": (data) => {
    const roomId = parseRoomId(data);
    if (roomId) dispatch({ type: "ending-soon", roomId });
  },
  "call.offer": onOffer,
  "call.answer": onAnswer,
  "call.ice-candidate": onIceCandidate,
  ...Object.fromEntries(
    ["invite", "accept", "reject", "end", "offer", "answer", "ice-candidate"].map((name) => [
      `call.${name}.error`,
      errorHandler(`call.${name}.error`),
    ]),
  ),
};

export const onCallSocketClosed = () => dispatch({ type: "socket-closed" });

// After a reconnect or restart, a user left waiting for the other side
// asks again, so the server's active_call decides between waiting and ringing.
export function onCallSocketReconnected() {
  const state = current();
  if (state.phase === "waiting") joinCall(state.appointmentId);
}

export function resetCall() {
  InCallManager.stopRingtone();
  closeSession();
  useCallStore.setState({ state: idle });
}

export function useCall() {
  return useCallStore();
}

export const useCallPhase = () => useCallStore((store) => store.state.phase);

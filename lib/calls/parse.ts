import type {
  Call,
  CallDTO,
  CallError,
  CallErrorCode,
  CallStatus,
  EndReason,
  Party,
} from "../../types/call.types";

const errorCodes: readonly CallErrorCode[] = [
  "call/user-offline",
  "call/user-busy",
  "call/window-closed",
  "call/not-allowed",
  "call/not-participant",
  "call/not-found",
  "call/already-ended",
  "appointment/not-found",
];
const endReasons: readonly EndReason[] = [
  "hangup",
  "missed",
  "appointment_ended",
  "peer_disconnected",
];
const statuses: readonly CallStatus[] = ["RINGING", "ACCEPTED", "REJECTED", "MISSED", "ENDED"];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const oneOf = <T extends string>(options: readonly T[], value: unknown): T | null =>
  options.includes(value as T) ? (value as T) : null;

function parseParty(value: unknown): Party | null {
  if (!isRecord(value) || typeof value.username !== "string") return null;
  return {
    username: value.username,
    display_name: typeof value.display_name === "string" ? value.display_name : value.username,
    profile_pic: typeof value.profile_pic === "string" ? value.profile_pic : null,
    role: value.role === "MIDWIFE" ? "MIDWIFE" : "PATIENT",
  };
}

export function parseCall(value: unknown): Call | null {
  if (!isRecord(value)) return null;
  const dto = value as Partial<CallDTO>;
  const caller = parseParty(dto.caller);
  const callee = parseParty(dto.callee);
  const callType = oneOf(["AUDIO", "VIDEO"] as const, dto.call_type);
  const status = oneOf(statuses, dto.status);
  if (
    typeof dto.id !== "number" ||
    typeof dto.room_id !== "string" ||
    typeof dto.appointment !== "number" ||
    typeof dto.ends_at !== "string" ||
    !caller ||
    !callee ||
    !callType ||
    !status
  ) {
    return null;
  }
  return {
    id: dto.id,
    roomId: dto.room_id,
    appointmentId: dto.appointment,
    caller,
    callee,
    callType,
    status,
    endsAt: dto.ends_at,
  };
}

export function parseRoomId(value: unknown): string | null {
  return isRecord(value) && typeof value.room_id === "string" ? value.room_id : null;
}

export function parseCallEnd(
  value: unknown,
): { roomId: string; status: CallStatus | null; reason: EndReason | null } | null {
  const roomId = parseRoomId(value);
  if (!roomId || !isRecord(value)) return null;
  return {
    roomId,
    status: oneOf(statuses, value.status),
    reason: oneOf(endReasons, value.reason),
  };
}

export function parseCallError(value: unknown): CallError {
  const record = isRecord(value) ? value : {};
  return {
    code: oneOf(errorCodes, record.code),
    message: typeof record.error === "string" ? record.error : "Something went wrong with the call",
  };
}

export function parseSignal(
  value: unknown,
): { roomId: string; sdp?: string; candidate?: Record<string, unknown> } | null {
  const roomId = parseRoomId(value);
  if (!roomId || !isRecord(value)) return null;
  return {
    roomId,
    sdp: typeof value.sdp === "string" ? value.sdp : undefined,
    candidate: isRecord(value.candidate) ? value.candidate : undefined,
  };
}

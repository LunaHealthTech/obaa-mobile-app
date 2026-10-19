export type Role = "PATIENT" | "MIDWIFE";

export interface Party {
  username: string;
  display_name: string;
  // Relative media path (e.g. "/media/..."); prefix with apiOrigin.
  profile_pic: string | null;
  role: Role;
}

export type CallType = "AUDIO" | "VIDEO";

export type CallStatus = "RINGING" | "ACCEPTED" | "REJECTED" | "MISSED" | "ENDED";

export interface Call {
  id: number;
  roomId: string;
  appointmentId: number;
  caller: Party;
  callee: Party;
  callType: CallType;
  status: CallStatus;
  endsAt: string;
}

export type EndReason = "hangup" | "missed" | "appointment_ended" | "peer_disconnected";

export type CallErrorCode =
  | "call/user-offline"
  | "call/user-busy"
  | "call/window-closed"
  | "call/not-allowed"
  | "call/not-participant"
  | "call/not-found"
  | "call/already-ended"
  | "appointment/not-found";

export interface CallError {
  code: CallErrorCode | null;
  message: string;
}

export interface TurnCredentials {
  username: string;
  password: string;
  ttl: number;
  uris: string[];
  stun_uris: string[];
}

export interface CallDTO {
  id: number;
  room_id: string;
  appointment: number;
  caller: Party;
  callee: Party;
  call_type: CallType;
  status: CallStatus;
  ends_at: string;
}

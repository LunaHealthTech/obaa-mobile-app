import {
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
} from "react-native-webrtc";
import InCallManager from "react-native-incall-manager";
import type { CallType, TurnCredentials } from "@/types/call.types";

export type IceCandidateJSON = {
  candidate: string;
  sdpMid: string | null;
  sdpMLineIndex: number | null;
};

type Options = {
  turn: TurnCredentials;
  callType: CallType;
  onIceCandidate: (candidate: IceCandidateJSON) => void;
  onRemoteStream: (stream: MediaStream) => void;
  onConnectionChange: (state: "connected" | "failed") => void;
};

export type PeerSession = Awaited<ReturnType<typeof createPeerSession>>;

export async function createPeerSession({
  turn,
  callType,
  onIceCandidate,
  onRemoteStream,
  onConnectionChange,
}: Options) {
  const localStream = await mediaDevices.getUserMedia({
    audio: true,
    video: callType === "VIDEO" ? { facingMode: "user" } : false,
  });
  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: turn.uris, username: turn.username, credential: turn.password },
      { urls: turn.stun_uris },
    ],
  });
  localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

  // Candidates can arrive before the remote description they belong to.
  let pendingCandidates: IceCandidateJSON[] = [];
  let closed = false;

  pc.addEventListener("icecandidate", (event) => {
    if (event.candidate) onIceCandidate(event.candidate.toJSON() as IceCandidateJSON);
  });
  pc.addEventListener("track", (event) => {
    const stream = event.streams?.[0];
    if (stream) onRemoteStream(stream);
  });
  pc.addEventListener("connectionstatechange", () => {
    if (pc.connectionState === "connected" || pc.connectionState === "failed") {
      onConnectionChange(pc.connectionState);
    }
  });

  const flushCandidates = async () => {
    const queued = pendingCandidates;
    pendingCandidates = [];
    for (const candidate of queued) await pc.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const setRemote = async (type: "offer" | "answer", sdp: string) => {
    await pc.setRemoteDescription(new RTCSessionDescription({ type, sdp }));
    await flushCandidates();
  };

  return {
    localStream,
    async createOffer() {
      const offer = await pc.createOffer({});
      await pc.setLocalDescription(offer);
      return offer.sdp as string;
    },
    async answerOffer(sdp: string) {
      await setRemote("offer", sdp);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      return answer.sdp as string;
    },
    acceptAnswer: (sdp: string) => setRemote("answer", sdp),
    async addCandidate(candidate: IceCandidateJSON) {
      if (pc.remoteDescription) await pc.addIceCandidate(new RTCIceCandidate(candidate));
      else pendingCandidates.push(candidate);
    },
    startAudioRoute() {
      InCallManager.start({ media: callType === "VIDEO" ? "video" : "audio" });
      InCallManager.setForceSpeakerphoneOn(callType === "VIDEO");
    },
    setMuted(muted: boolean) {
      localStream.getAudioTracks().forEach((track) => (track.enabled = !muted));
    },
    setCameraOff(off: boolean) {
      localStream.getVideoTracks().forEach((track) => (track.enabled = !off));
    },
    setSpeaker(on: boolean) {
      InCallManager.setForceSpeakerphoneOn(on);
    },
    close() {
      if (closed) return;
      closed = true;
      localStream.getTracks().forEach((track) => track.stop());
      localStream.release();
      pc.close();
      InCallManager.stop();
    },
  };
}

import { useEffect, useRef } from "react";
import { BackHandler, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RTCView } from "react-native-webrtc";
import { differenceInSeconds, format } from "date-fns";
import { RadialBackground } from "@/components/RadialBackground";
import { MidwifeAvatar } from "@/components/MidwifeAvatar";
import { Icon, type IconName } from "@/components/icons/Icon";
import { Body, ButtonText, Caption, Label, PageTitle } from "@/components/Typography";
import { theme } from "@/constants/theme";
import { formatCountdown } from "@/lib/appointments/format";
import { appointmentOf, callOf, type CallState } from "@/lib/calls/machine";
import { appointmentCounterpart, otherParty, roleNoun, type Counterpart } from "@/lib/calls/parties";
import { useNow } from "@/lib/useNow";
import { useAppointment } from "@/viewmodel/useAppointments";
import { homeRouteFor, useCurrentUser } from "@/viewmodel/useAuth";
import {
  acceptCall,
  callAgain,
  declineCall,
  dismissCall,
  hangUp,
  toggleCamera,
  toggleMute,
  toggleSpeaker,
  useCall,
} from "@/viewmodel/useCall";

const HANG_UP_RED = "#E5484D";
const ANSWER_GREEN = "#22A06B";

function statusLine(state: CallState, peer: Counterpart | null, now: Date) {
  const who = peer ? `your ${roleNoun(peer.role)}` : "the other person";
  switch (state.phase) {
    case "preparing":
      return "Starting call...";
    case "waiting":
      return `Waiting for ${who} to join. Keep this screen open and their call will come through here.`;
    case "outgoing":
      return "Calling...";
    case "incoming":
      return `Incoming ${state.call.callType === "VIDEO" ? "video" : "audio"} call`;
    case "connecting":
      return "Connecting...";
    case "in-call": {
      const left = Math.max(0, differenceInSeconds(new Date(state.call.endsAt), now));
      return `${formatCountdown(left)} left`;
    }
    case "ended":
    case "blocked":
      return state.message;
    case "idle":
      return "";
  }
}

function RoundButton({
  icon,
  label,
  onPress,
  tone = "glass",
  size = 56,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  tone?: "glass" | "light" | "accept" | "hangup";
  size?: number;
}) {
  const styles = {
    glass: { bg: "rgba(255,255,255,0.16)", color: "#FFFFFF" },
    light: { bg: "#FFFFFF", color: theme.mainText },
    accept: { bg: ANSWER_GREEN, color: "#FFFFFF" },
    hangup: { bg: HANG_UP_RED, color: "#FFFFFF" },
  }[tone];
  return (
    <View className={"items-center gap-2"}>
      <Pressable
        onPress={onPress}
        accessibilityRole={"button"}
        accessibilityLabel={label}
        className={"rounded-full items-center justify-center active:opacity-80"}
        style={{ width: size, height: size, backgroundColor: styles.bg }}
      >
        <Icon name={icon} size={size * 0.42} color={styles.color} />
      </Pressable>
      <Caption className={"text-white"}>{label}</Caption>
    </View>
  );
}

export default function CallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const now = useNow();
  const user = useCurrentUser();
  const { state, localStream, remoteStream, muted, cameraOff, speakerOn } = useCall();
  const call = callOf(state);
  const { data: appointment } = useAppointment(appointmentOf(state) ?? NaN);

  const navigatedAway = useRef(false);
  useEffect(() => {
    if (state.phase !== "idle" || navigatedAway.current) return;
    if (router.canGoBack()) router.back();
    else router.replace(homeRouteFor(user));
  }, [state.phase, router, user]);

  // Leaving the screen mid-call would strand the call with no controls.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, []);

  const peer: Counterpart | null = call
    ? otherParty(call, user?.username ?? "")
    : state.phase === "ended" && state.peer
      ? state.peer
      : appointment && user
        ? appointmentCounterpart(appointment, user.role)
        : null;

  const isVideo =
    (call?.callType ?? (state.phase === "ended" ? state.callType : null) ??
      appointment?.consultation_type) === "VIDEO";
  const live = state.phase === "outgoing" || state.phase === "connecting" || state.phase === "in-call";
  const showRemote = isVideo && state.phase === "in-call" && remoteStream;
  const showLocalFull = isVideo && live && !showRemote && localStream && !cameraOff;
  const showLocalPip = showRemote && localStream && !cameraOff;
  const onVideo = showRemote || showLocalFull;

  // The backend lets only the patient move a confirmed appointment, even
  // after it has started, so a no-show midwife doesn't strand them.
  const canReschedule =
    state.phase === "waiting" && user?.role !== "MIDWIFE" && !!appointment?.midwife;
  const reschedule = () => {
    if (!appointment?.midwife) return;
    navigatedAway.current = true;
    router.replace({
      pathname: "/consult/book-midwife",
      params: { midwifeId: String(appointment.midwife.id), rescheduleId: String(appointment.id) },
    });
    dismissCall();
  };

  return (
    <View className={"flex-1 bg-[#0B2F33]"}>
      {!onVideo && <RadialBackground colors={["#0FCAD2CC", "#015364"]} />}
      {showRemote && (
        <RTCView
          streamURL={remoteStream.toURL()}
          objectFit={"cover"}
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
        />
      )}
      {showLocalFull && (
        <RTCView
          streamURL={localStream.toURL()}
          objectFit={"cover"}
          mirror={true}
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
        />
      )}
      {onVideo && (
        <>
          <View className={"absolute inset-0 bg-[rgba(0,0,0,0.15)]"} />
          <View
            className={"absolute left-0 right-0 top-0 bg-[rgba(0,0,0,0.35)]"}
            style={{ height: insets.top + 200 }}
          />
        </>
      )}

      <View className={"flex-1 px-6"} style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}>
        <View className={"items-center"}>
          {!onVideo && peer && (
            <View className={"rounded-full p-1.5 bg-[rgba(255,255,255,0.14)] mt-10 mb-6"}>
              <MidwifeAvatar midwife={peer} size={112} />
            </View>
          )}
          {peer && (
            <>
              <PageTitle className={"text-white text-center"}>{peer.display_name}</PageTitle>
              <Caption className={"text-[#CCDDE0] uppercase tracking-widest mt-1"}>
                {peer.role === "MIDWIFE" ? "Midwife" : "Patient"}
              </Caption>
            </>
          )}
          <Body
            className={"text-white text-center mt-3"}
            accessibilityLiveRegion={"polite"}
          >
            {statusLine(state, peer, now)}
          </Body>
          {state.phase === "waiting" && state.endsAt && (
            <View className={"flex-row items-center gap-2 bg-[rgba(255,255,255,0.14)] rounded-full px-4 py-2 mt-5"}>
              <Icon name={"clock"} size={16} color={"#FFFFFF"} />
              <Label className={"text-white"}>
                Ends at {format(new Date(state.endsAt), "h:mm a")} ·{" "}
                {formatCountdown(Math.max(0, differenceInSeconds(new Date(state.endsAt), now)))} left
              </Label>
            </View>
          )}
        </View>

        {state.phase === "in-call" && state.endingSoon && (
          <View
            className={"flex-row items-center gap-2 bg-[#B26B00] rounded-xl px-4 py-3 mt-5 self-center"}
            accessibilityLiveRegion={"assertive"}
          >
            <Icon name={"timer"} size={18} color={"#FFFFFF"} />
            <Label className={"text-white"}>
              Less than a minute left. The call ends at {format(new Date(state.call.endsAt), "h:mm a")}.
            </Label>
          </View>
        )}

        {showLocalPip && (
          <View
            className={"absolute right-4 rounded-2xl overflow-hidden border-2 border-white"}
            style={{ top: insets.top + 16, width: 104, height: 148 }}
          >
            <RTCView
              streamURL={localStream.toURL()}
              objectFit={"cover"}
              mirror={true}
              zOrder={1}
              style={{ flex: 1 }}
            />
          </View>
        )}

        <View className={"flex-1"} />

        {state.phase === "incoming" ? (
          <View className={"flex-row justify-around"}>
            <RoundButton icon={"phone-off"} label={"Decline"} tone={"hangup"} size={68} onPress={declineCall} />
            <RoundButton
              icon={isVideo ? "video" : "phone"}
              label={"Accept"}
              tone={"accept"}
              size={68}
              onPress={acceptCall}
            />
          </View>
        ) : state.phase === "ended" || state.phase === "blocked" ? (
          <View className={"gap-3"}>
            {state.phase === "ended" && state.canRetry && (
              <Pressable
                onPress={callAgain}
                accessibilityRole={"button"}
                className={"bg-white rounded-full py-4 flex-row items-center justify-center gap-2 active:opacity-80"}
              >
                <Icon name={isVideo ? "video" : "phone"} size={18} color={theme.primaryColor} />
                <ButtonText className={"text-primaryColor"}>Call again</ButtonText>
              </Pressable>
            )}
            <Pressable
              onPress={dismissCall}
              accessibilityRole={"button"}
              className={"border-2 border-white rounded-full py-4 items-center active:opacity-80"}
            >
              <ButtonText className={"text-white"}>Close</ButtonText>
            </Pressable>
          </View>
        ) : (
          <View className={"gap-8"}>
            {live && (
              <View className={"flex-row justify-center gap-6"}>
                <RoundButton
                  icon={muted ? "mic-off" : "mic"}
                  label={muted ? "Unmute" : "Mute"}
                  tone={muted ? "light" : "glass"}
                  onPress={toggleMute}
                />
                {isVideo && (
                  <RoundButton
                    icon={cameraOff ? "video-off" : "video"}
                    label={cameraOff ? "Camera on" : "Camera off"}
                    tone={cameraOff ? "light" : "glass"}
                    onPress={toggleCamera}
                  />
                )}
                <RoundButton
                  icon={speakerOn ? "volume-high" : "volume-low"}
                  label={speakerOn ? "Speaker" : "Earpiece"}
                  tone={speakerOn ? "light" : "glass"}
                  onPress={toggleSpeaker}
                />
              </View>
            )}
            {canReschedule && (
              <Pressable
                onPress={reschedule}
                accessibilityRole={"button"}
                accessibilityHint={"Leaves the call and picks another time with the same midwife"}
                className={"bg-white rounded-full py-4 flex-row items-center justify-center gap-2 active:opacity-80"}
              >
                <Icon name={"calendar"} size={18} color={theme.primaryColor} />
                <ButtonText className={"text-primaryColor"}>Reschedule</ButtonText>
              </Pressable>
            )}
            <View className={"items-center"}>
              <RoundButton
                icon={"phone-off"}
                label={live ? "End call" : "Cancel"}
                tone={"hangup"}
                size={68}
                onPress={hangUp}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

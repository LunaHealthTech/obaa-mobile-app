import { Pressable } from "react-native";
import { format } from "date-fns";
import { theme } from "@/constants/theme";
import { Icon } from "@/components/icons/Icon";
import { ButtonText, Label } from "@/components/Typography";
import { consultationTypeIcon } from "@/components/AppointmentSummary";
import { joinState, type JoinState } from "@/lib/calls/joinWindow";
import { formatCountdown } from "@/lib/appointments/format";
import { useNow } from "@/lib/useNow";
import { joinCall } from "@/viewmodel/useCall";
import type { Appointment } from "@/types/appointment.types";

const HOUR = 3600;

function buttonLabel(state: Exclude<JoinState, { kind: "hidden" }>, appointment: Appointment) {
  switch (state.kind) {
    case "open":
      return appointment.active_call ? "Join call (ringing)" : "Join call";
    case "closed":
      return "Session has ended";
    case "locked":
      return state.secondsUntilOpen < HOUR
        ? `Join call in ${formatCountdown(state.secondsUntilOpen)}`
        : `Call opens at ${format(new Date(appointment.call_opens_at!), "h:mm a")}`;
  }
}

type Props = { appointment: Appointment; compact?: boolean };

export function JoinCallButton({ appointment, compact = false }: Props) {
  const now = useNow();
  const state = joinState(appointment, now);
  if (state.kind === "hidden") return null;

  const open = state.kind === "open";
  const label = buttonLabel(state, appointment);
  const Text = compact ? Label : ButtonText;

  return (
    <Pressable
      onPress={() => joinCall(appointment.id)}
      disabled={!open}
      accessibilityRole={"button"}
      accessibilityState={{ disabled: !open }}
      className={`rounded-full flex-row items-center justify-center ${
        compact ? "gap-1.5 py-2.5 mt-3" : "gap-2 py-4"
      } ${open ? "bg-primaryColor active:opacity-80" : "bg-[#455A641A]"}`}
    >
      <Icon
        name={consultationTypeIcon[appointment.consultation_type]}
        size={compact ? 15 : 18}
        color={open ? "#FFFFFF" : theme.subText}
      />
      <Text className={open ? "text-white" : "text-subText"}>{label}</Text>
    </Pressable>
  );
}

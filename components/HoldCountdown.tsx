import { useEffect } from "react";
import { View } from "react-native";
import { theme } from "@/constants/theme";
import { Icon } from "@/components/icons/Icon";
import { Label } from "@/components/Typography";
import { formatCountdown } from "@/lib/appointments/format";
import { holdSecondsLeft } from "@/lib/appointments/status";
import { useNow } from "@/lib/useNow";
import type { Appointment } from "@/types/appointment.types";

type Props = {
  appointment: Pick<Appointment, "status" | "hold_expires_at">;
  onExpire?: () => void;
};

export function HoldCountdown({ appointment, onExpire }: Props) {
  const secondsLeft = holdSecondsLeft(appointment, useNow());
  const expired = secondsLeft === 0;

  useEffect(() => {
    if (expired) onExpire?.();
  }, [expired, onExpire]);

  return (
    <View
      accessibilityLiveRegion={"polite"}
      className={`flex-row items-center gap-2 rounded-xl px-4 py-3 ${expired ? "bg-[#D32F2F1A]" : "bg-[#B26B001A]"}`}
    >
      <Icon
        name={expired ? "alert-circle" : "timer"}
        size={18}
        color={expired ? theme.urgentColor : theme.warningColor}
      />
      <Label className={expired ? "text-urgentColor" : "text-warningColor"}>
        {expired
          ? "Your slot hold has expired"
          : `Slot held for ${formatCountdown(secondsLeft)}`}
      </Label>
    </View>
  );
}

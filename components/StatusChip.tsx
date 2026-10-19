import { View } from "react-native";
import { Caption } from "@/components/Typography";
import { statusInfo, type StatusTone } from "@/lib/appointments/status";
import type { Appointment } from "@/types/appointment.types";

const toneClasses: Record<StatusTone, { box: string; text: string }> = {
  active: { box: "bg-[#0F969C1A]", text: "text-primaryColor" },
  pending: { box: "bg-[#B26B001A]", text: "text-warningColor" },
  done: { box: "bg-[#455A641A]", text: "text-subText" },
  ended: { box: "bg-[#72777A1A]", text: "text-greyColor" },
  alert: { box: "bg-[#D32F2F1A]", text: "text-urgentColor" },
};

export function StatusChip({
  appointment,
}: {
  appointment: Pick<Appointment, "status" | "status_label">;
}) {
  const info = statusInfo(appointment.status, appointment.status_label);
  const tone = toneClasses[info.tone];
  return (
    <View className={`${tone.box} rounded-full px-3 py-1`}>
      <Caption className={tone.text}>{info.chip}</Caption>
    </View>
  );
}

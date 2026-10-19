import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { theme } from "@/constants/theme";
import { Icon } from "@/components/icons/Icon";
import { IconBadge } from "@/components/icons/IconBadge";
import { MidwifeAvatar } from "@/components/MidwifeAvatar";
import { StatusChip } from "@/components/StatusChip";
import { JoinCallButton } from "@/components/JoinCallButton";
import { Caption, CardTitle } from "@/components/Typography";
import { consultationTypeIcon } from "@/components/AppointmentSummary";
import { concernLabel } from "@/lib/appointments/concerns";
import { longDate, timeRange } from "@/lib/appointments/format";
import { routeForAppointment, statusInfo } from "@/lib/appointments/status";
import { appointmentCounterpart } from "@/lib/calls/parties";
import { useCurrentUser } from "@/viewmodel/useAuth";
import type { Appointment } from "@/types/appointment.types";

export function ConsultationRow({ appointment }: { appointment: Appointment }) {
  const router = useRouter();
  const role = useCurrentUser()?.role ?? "PATIENT";
  const counterpart = appointmentCounterpart(appointment, role);
  const name = counterpart?.display_name ?? "Matching a midwife";
  const when = `${longDate(appointment.scheduled_start)}, ${timeRange(
    appointment.scheduled_start,
    appointment.scheduled_end,
  )}`;
  const open = () =>
    router.push(
      role === "MIDWIFE"
        ? { pathname: "/midwife/appointment", params: { appointmentId: String(appointment.id) } }
        : routeForAppointment(appointment, new Date()),
    );

  return (
    <Pressable
      onPress={open}
      accessibilityRole={"button"}
      accessibilityLabel={`${appointment.consultation_type_label} with ${name}, ${when}, ${statusInfo(appointment.status, appointment.status_label).chip}`}
      className={"bg-white border border-borderGreyColor rounded-xl p-4 active:opacity-80"}
    >
      <View className={"flex-row items-center gap-3"}>
        {counterpart ? (
          <MidwifeAvatar midwife={counterpart} size={40} />
        ) : (
          <IconBadge name={"search"} size={"sm"} />
        )}
        <View className={"flex-1"}>
          <CardTitle className={"text-mainText"}>{name}</CardTitle>
          <View className={"flex-row items-center gap-1.5 mt-0.5"}>
            <Icon
              name={consultationTypeIcon[appointment.consultation_type]}
              size={13}
              color={theme.greyColor}
            />
            <Caption className={"text-greyColor flex-shrink"}>
              {appointment.consultation_type_label} · {concernLabel(appointment.concern)}
            </Caption>
          </View>
        </View>
        <StatusChip appointment={appointment} />
      </View>
      <View className={"flex-row items-center gap-1.5 mt-3 pt-3 border-t border-borderGreyColor"}>
        <Icon name={"calendar"} size={14} color={theme.subText} />
        <Caption className={"text-subText"}>{when}</Caption>
      </View>
      <JoinCallButton appointment={appointment} compact={true} />
    </Pressable>
  );
}

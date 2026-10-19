import { View } from "react-native";
import { theme } from "@/constants/theme";
import { Icon, type IconName } from "@/components/icons/Icon";
import { IconBadge } from "@/components/icons/IconBadge";
import { MidwifeAvatar } from "@/components/MidwifeAvatar";
import { Caption, CardTitle, Label } from "@/components/Typography";
import { longDate, timeRange } from "@/lib/appointments/format";
import type {
  Appointment,
  ConsultationType,
  MidwifeSummary,
} from "@/types/appointment.types";
import type { Role } from "@/types/call.types";

export const consultationTypeIcon: Record<ConsultationType, IconName> = {
  CHAT: "chat",
  AUDIO: "phone",
  VIDEO: "video",
};

export function VerifiedMark({ verified, size = 16 }: { verified: boolean; size?: number }) {
  if (!verified) return null;
  return <Icon name={"badge-check"} size={size} color={theme.primaryColor} />;
}

export function MidwifeHeader({ midwife }: { midwife: MidwifeSummary }) {
  return (
    <View className={"flex-row items-center gap-3"}>
      <MidwifeAvatar midwife={midwife} />
      <View className={"flex-1"}>
        <View className={"flex-row items-center gap-1.5"}>
          <CardTitle className={"text-mainText"}>{midwife.display_name}</CardTitle>
          <VerifiedMark verified={midwife.verified} />
        </View>
        <Caption className={"text-greyColor mt-0.5"}>{midwife.credential}</Caption>
      </View>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View className={"flex-row items-center gap-3"}>
      <IconBadge name={icon} size={"sm"} />
      <View className={"flex-1"}>
        <Caption className={"text-greyColor"}>{label}</Caption>
        <Label className={"text-mainText mt-0.5"}>{value}</Label>
      </View>
    </View>
  );
}

export function AppointmentInfoRows({ appointment }: { appointment: Appointment }) {
  return (
    <View className={"gap-4"}>
      <InfoRow
        icon={"calendar"}
        label={"Date"}
        value={longDate(appointment.scheduled_start)}
      />
      <InfoRow
        icon={"clock"}
        label={"Time"}
        value={timeRange(appointment.scheduled_start, appointment.scheduled_end)}
      />
      <InfoRow
        icon={consultationTypeIcon[appointment.consultation_type]}
        label={"Type"}
        value={appointment.consultation_type_label}
      />
    </View>
  );
}

function PatientHeader({ patient }: { patient: Appointment["patient"] }) {
  return (
    <View className={"flex-row items-center gap-3"}>
      <MidwifeAvatar midwife={patient} />
      <View className={"flex-1"}>
        <CardTitle className={"text-mainText"}>{patient.display_name}</CardTitle>
        <Caption className={"text-greyColor mt-0.5"}>Patient</Caption>
      </View>
    </View>
  );
}

export function AppointmentCard({
  appointment,
  viewer = "PATIENT",
}: {
  appointment: Appointment;
  viewer?: Role;
}) {
  const header =
    viewer === "MIDWIFE" ? (
      <PatientHeader patient={appointment.patient} />
    ) : (
      appointment.midwife && <MidwifeHeader midwife={appointment.midwife} />
    );
  return (
    <View className={"bg-white rounded-xl border border-borderGreyColor p-4"}>
      {header}
      <View className={header ? "mt-4 pt-4 border-t border-borderGreyColor" : ""}>
        <AppointmentInfoRows appointment={appointment} />
      </View>
    </View>
  );
}

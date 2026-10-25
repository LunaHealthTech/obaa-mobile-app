import { View, Pressable, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { differenceInSeconds } from "date-fns";
import { ScreenHeader } from "@/components/ScreenHeader";
import { JoinCallButton } from "@/components/JoinCallButton";
import { theme } from "@/constants/theme";
import {
  Body,
  ButtonText,
  Caption,
  CardTitle,
  Label,
  PageTitle,
} from "@/components/Typography";
import { AppointmentCard } from "@/components/AppointmentSummary";
import { StatusChip } from "@/components/StatusChip";
import {
  canCancel,
  canRebookFree,
  closedStatusMessage,
  holdSecondsLeft,
} from "@/lib/appointments/status";
import { formatFee } from "@/lib/appointments/format";
import { Icon } from "@/components/icons/Icon";
import { IconBadge } from "@/components/icons/IconBadge";
import { useNow } from "@/lib/useNow";
import { useCurrentUser } from "@/viewmodel/useAuth";
import {
  reactToBookingError,
  useAppointment,
  useCancelAppointment,
  useRefundAppointment,
} from "@/viewmodel/useAppointments";

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export default function AppointmentPage() {
  const router = useRouter();
  const { appointmentId } = useLocalSearchParams<{ appointmentId: string }>();
  const id = Number(appointmentId);
  const { data: appointment, isError, refetch } = useAppointment(id);
  const cancel = useCancelAppointment(id);
  const refund = useRefundAppointment(id);
  const now = useNow();
  const role = useCurrentUser()?.role ?? "PATIENT";

  const header = (
    <ScreenHeader
      title={
        appointment && ["CONFIRMED", "MATCHED"].includes(appointment.status)
          ? "Upcoming Appointment"
          : "Appointment"
      }
      onBack={() => router.replace("/consult")}
      right={appointment && <StatusChip appointment={appointment} />}
      bordered={true}
    />
  );

  if (!appointment) {
    return (
      <View className={"bg-white flex-1"}>
        {header}
        <View className={"flex-1 items-center justify-center px-8"}>
          {isError ? (
            <Pressable onPress={() => refetch()} accessibilityRole={"button"}>
              <Body className={"text-greyColor text-center"}>
                Couldn&apos;t load this appointment.{" "}
                <Label className={"text-primaryColor"}>Try again</Label>
              </Body>
            </Pressable>
          ) : (
            <ActivityIndicator color={"#0F969C"} />
          )}
        </View>
      </View>
    );
  }

  const confirmed = appointment.status === "CONFIRMED";
  const cancellable = canCancel(appointment, now);
  const isUpcoming = confirmed || appointment.status === "MATCHED";
  const remainingSeconds = Math.max(
    0,
    differenceInSeconds(new Date(appointment.scheduled_start), now),
  );
  const countdownUnits = [
    { label: "Days", value: Math.floor(remainingSeconds / 86400) },
    { label: "Hours", value: Math.floor((remainingSeconds % 86400) / 3600) },
    { label: "Min", value: Math.floor((remainingSeconds % 3600) / 60) },
    { label: "Sec", value: remainingSeconds % 60 },
  ];
  const awaitingPayment = holdSecondsLeft(appointment, now) > 0;

  const handleCancel = () => {
    Alert.alert(
      "Cancel this consultation?",
      confirmed
        ? "Payments for cancelled consultations aren't refunded yet."
        : "Your held slot will be released.",
      [
        { text: "Keep it", style: "cancel" },
        {
          text: "Cancel consultation",
          style: "destructive",
          onPress: () =>
            cancel.mutate(undefined, {
              onError: (error) =>
                reactToBookingError(error, "Couldn't cancel this consultation"),
            }),
        },
      ],
    );
  };

  const handleRefund = () => {
    Alert.alert(
      `Refund ${formatFee(appointment.fee)}?`,
      "You'll get the full fee back and this consultation can't be rebooked afterwards.",
      [
        { text: "Keep my free rebooking", style: "cancel" },
        {
          text: "Refund",
          onPress: () =>
            refund.mutate(undefined, {
              onError: (error) => reactToBookingError(error, "Couldn't refund this consultation"),
            }),
        },
      ],
    );
  };

  const handleReschedule = () => {
    if (!appointment.midwife) return;
    router.push({
      pathname: "/consult/book-midwife",
      params: {
        midwifeId: String(appointment.midwife.id),
        rescheduleId: String(appointment.id),
      },
    });
  };

  return (
    <View className={"bg-white flex-1"}>
      {header}

      <ScrollView className={"flex-1"} contentContainerStyle={{ paddingBottom: 24 }}>
        {isUpcoming ? (
          <View className={"px-4 mt-6"}>
            <View
              className={"bg-[#0F969C0D] rounded-2xl p-4 items-center"}
              accessible={true}
              accessibilityLabel={`Session starts in ${countdownUnits
                .map((u) => `${u.value} ${u.label}`)
                .join(", ")}`}
            >
              <Body className={"text-greyColor"}>Session starts in</Body>
              <View className={"flex-row gap-3 mt-3"}>
                {countdownUnits.map((unit) => (
                  <View
                    key={unit.label}
                    className={"bg-white rounded-xl items-center justify-center w-16 h-16"}
                  >
                    <PageTitle className={"text-primaryColor"}>{pad(unit.value)}</PageTitle>
                    <Caption className={"text-greyColor mt-0.5"}>{unit.label}</Caption>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : canRebookFree(appointment, role) ? (
          <View className={"px-4 mt-6"}>
            <View className={"bg-[#D32F2F0D] border border-[#D32F2F33] rounded-2xl p-4 gap-3"}>
              <View className={"flex-row items-center gap-3"}>
                <IconBadge name={"user-x"} tone={"urgent"} size={"sm"} />
                <View className={"flex-1"}>
                  <CardTitle className={"text-mainText"}>Your midwife couldn&apos;t make it</CardTitle>
                  <Body className={"text-greyColor mt-0.5"}>
                    Rebook with {appointment.midwife?.display_name ?? "your midwife"} at no extra cost.
                  </Body>
                </View>
              </View>
              <Pressable
                onPress={handleReschedule}
                accessibilityRole={"button"}
                className={"bg-primaryColor rounded-full py-4 flex-row items-center justify-center gap-2 active:opacity-80"}
              >
                <Icon name={"calendar"} size={18} color={"#FFFFFF"} />
                <ButtonText className={"text-white"}>Book again free</ButtonText>
              </Pressable>
              <Pressable
                onPress={handleRefund}
                disabled={refund.isPending}
                accessibilityRole={"button"}
                className={"py-2 flex-row items-center justify-center gap-2"}
              >
                {refund.isPending && <ActivityIndicator color={theme.subText} size={"small"} />}
                <Label className={"text-subText"}>
                  Or get a full refund of {formatFee(appointment.fee)}
                </Label>
              </Pressable>
            </View>
          </View>
        ) : (
          <View className={"px-4 mt-6"}>
            <View className={"bg-[#72777A1A] rounded-2xl p-4"}>
              <Body className={"text-subText"}>{closedStatusMessage(appointment)}</Body>
            </View>
          </View>
        )}

        <View className={"px-4 mt-4"}>
          <AppointmentCard appointment={appointment} />
        </View>

        {awaitingPayment && (
          <View className={"px-4 mt-6"}>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/consult/checkout",
                  params: { appointmentId: String(appointment.id) },
                })
              }
              accessibilityRole={"button"}
              className={"bg-primaryColor rounded-full py-4 items-center justify-center active:opacity-80"}
            >
              <ButtonText className={"text-white"}>Complete payment</ButtonText>
            </Pressable>
          </View>
        )}

        {confirmed && appointment.consultation_type !== "CHAT" && (
          <View className={"px-4 mt-6"}>
            <JoinCallButton appointment={appointment} />
          </View>
        )}

        {(cancellable || confirmed) && (
          <View className={"px-4 mt-4 flex-row gap-3"}>
            {cancellable && (
              <Pressable
                onPress={handleCancel}
                disabled={cancel.isPending}
                accessibilityRole={"button"}
                className={
                  "flex-1 bg-white border-2 border-urgentColor rounded-full py-4 flex-row items-center justify-center gap-2 active:opacity-80"
                }
              >
                {cancel.isPending && <ActivityIndicator color={theme.urgentColor} size={"small"} />}
                <ButtonText className={"text-urgentColor"}>Cancel</ButtonText>
              </Pressable>
            )}
            {confirmed && (
              <Pressable
                onPress={handleReschedule}
                accessibilityRole={"button"}
                className={
                  "flex-1 bg-white border-2 border-borderGreyColor rounded-full py-4 items-center justify-center active:opacity-80"
                }
              >
                <ButtonText className={"text-mainText"}>Reschedule</ButtonText>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

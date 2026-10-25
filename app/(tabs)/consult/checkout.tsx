import { useState } from "react";
import { View, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ButtonText,
  CardTitle,
  Caption,
  Label,
  SectionHeading,
} from "@/components/Typography";
import { ScreenHeader } from "@/components/ScreenHeader";
import type { IconName } from "@/components/icons/Icon";
import { IconBadge } from "@/components/icons/IconBadge";
import { MidwifeHeader } from "@/components/AppointmentSummary";
import { HoldCountdown } from "@/components/HoldCountdown";
import { concernLabel } from "@/lib/appointments/concerns";
import { formatFee, longDate, timeRange } from "@/lib/appointments/format";
import { holdSecondsLeft } from "@/lib/appointments/status";
import { useNow } from "@/lib/useNow";
import {
  reactToBookingError,
  useAppointment,
  useConfirmAppointment,
} from "@/viewmodel/useAppointments";
import type { PaymentMethod } from "@/types/appointment.types";

const paymentMethods: { key: PaymentMethod; label: string; hint: string; icon: IconName }[] = [
  { key: "MOMO", label: "Mobile Money", hint: "Pay from your mobile wallet", icon: "smartphone" },
  { key: "CARD", label: "Debit / Credit Card", hint: "Pay with your bank card", icon: "credit-card" },
];

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className={"flex-row items-center justify-between"}>
      <Caption className={"text-subText"}>{label}</Caption>
      <Label className={"text-mainText"}>{value}</Label>
    </View>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { appointmentId } = useLocalSearchParams<{ appointmentId: string }>();
  const id = Number(appointmentId);
  const { data: appointment } = useAppointment(id);
  const confirm = useConfirmAppointment(id);
  const now = useNow();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("MOMO");

  if (!appointment?.midwife) {
    return (
      <View className={"bg-white flex-1 items-center justify-center"}>
        <ActivityIndicator color={"#0F969C"} />
      </View>
    );
  }

  const holdActive = holdSecondsLeft(appointment, now) > 0;
  const canPay = holdActive && !confirm.isPending;
  const fee = formatFee(appointment.fee);

  const pickAnotherTime = () =>
    router.replace({
      pathname: "/consult/match-preferences",
      params: { concern: appointment.concern },
    });

  const handlePayNow = () => {
    confirm.mutate(selectedMethod, {
      onSuccess: (confirmed) =>
        router.replace({
          pathname: "/consult/booking-confirmation",
          params: { appointmentId: String(confirmed.id) },
        }),
      onError: (error) => reactToBookingError(error, "Payment didn't go through"),
    });
  };

  return (
    <View className={"bg-white flex-1"}>
      <ScreenHeader title={"Checkout"} backDisabled={confirm.isPending} bordered={true} />

      <ScrollView className={"flex-1"}>
        <View className={"px-4 mt-4"}>
          <HoldCountdown appointment={appointment} />
        </View>

        <View className={"px-4 mt-6"}>
          <SectionHeading className={"text-mainText mb-3"}>
            Appointment Summary
          </SectionHeading>
          <View className={"bg-white rounded-xl border border-borderGreyColor p-4"}>
            <MidwifeHeader midwife={appointment.midwife} />
            <View className={"mt-4 pt-4 border-t border-borderGreyColor gap-3"}>
              <SummaryRow label={"Date"} value={longDate(appointment.scheduled_start)} />
              <SummaryRow
                label={"Time"}
                value={timeRange(appointment.scheduled_start, appointment.scheduled_end)}
              />
              <SummaryRow label={"Type"} value={appointment.consultation_type_label} />
              <SummaryRow label={"Support Topic"} value={concernLabel(appointment.concern)} />
            </View>
          </View>
        </View>

        <View className={"px-4 mt-6"}>
          <SectionHeading className={"text-mainText mb-3"}>
            Payment Method
          </SectionHeading>
          <View className={"gap-3"}>
            {paymentMethods.map((method) => {
              const isSelected = method.key === selectedMethod;
              return (
                <Pressable
                  key={method.key}
                  onPress={() => setSelectedMethod(method.key)}
                  accessibilityRole={"radio"}
                  accessibilityState={{ checked: isSelected }}
                  className={
                    isSelected
                      ? "flex-row items-center gap-3 bg-[#0F969C1A] border-2 border-primaryColor rounded-xl px-4 py-4"
                      : "flex-row items-center gap-3 bg-white border border-borderGreyColor rounded-xl px-4 py-4"
                  }
                >
                  <IconBadge
                    name={method.icon}
                    size={"sm"}
                    tone={isSelected ? "primary" : "neutral"}
                  />
                  <View className={"flex-1"}>
                    <Label className={isSelected ? "text-primaryColor" : "text-mainText"}>
                      {method.label}
                    </Label>
                    <Caption className={"text-greyColor mt-0.5"}>{method.hint}</Caption>
                  </View>
                  <View
                    className={`w-5 h-5 rounded-full items-center justify-center border-2 ${
                      isSelected ? "border-primaryColor" : "border-borderGreyColor"
                    }`}
                  >
                    {isSelected && <View className={"w-2.5 h-2.5 rounded-full bg-primaryColor"} />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className={"px-4 mt-6"}>
          <View
            className={
              "flex-row items-center justify-between bg-white border border-borderGreyColor rounded-xl px-4 py-4"
            }
          >
            <Label className={"text-mainText"}>Consultation Fee</Label>
            <CardTitle className={"text-mainText"}>{fee}</CardTitle>
          </View>
        </View>

        <View className={"h-6"} />
      </ScrollView>

      <View className={"px-4 py-4 border-t border-borderGreyColor"}>
        {holdActive ? (
          <Pressable
            onPress={handlePayNow}
            disabled={!canPay}
            accessibilityRole={"button"}
            accessibilityState={{ disabled: !canPay, busy: confirm.isPending }}
            className={`rounded-full py-4 flex-row items-center justify-center gap-2 active:opacity-80 ${
              canPay ? "bg-primaryColor" : "bg-borderGreyColor"
            }`}
          >
            {confirm.isPending && <ActivityIndicator color={"#fff"} size={"small"} />}
            <ButtonText className={"text-white"}>
              {confirm.isPending ? "Processing..." : `Pay ${fee}`}
            </ButtonText>
          </Pressable>
        ) : (
          <Pressable
            onPress={pickAnotherTime}
            accessibilityRole={"button"}
            className={
              "bg-white border-2 border-primaryColor rounded-full py-4 items-center justify-center active:opacity-80"
            }
          >
            <ButtonText className={"text-primaryColor"}>Pick another time</ButtonText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

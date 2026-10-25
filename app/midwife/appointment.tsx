import { useCallback } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { StatusChip } from "@/components/StatusChip";
import { AppointmentCard } from "@/components/AppointmentSummary";
import { JoinCallButton } from "@/components/JoinCallButton";
import { Body, Caption, Label } from "@/components/Typography";
import { concernLabel } from "@/lib/appointments/concerns";
import { theme } from "@/constants/theme";
import { useAppointment } from "@/viewmodel/useAppointments";

export default function MidwifeAppointmentPage() {
  const { appointmentId } = useLocalSearchParams<{ appointmentId: string }>();
  const { data: appointment, isError, refetch } = useAppointment(Number(appointmentId));

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  return (
    <View className={"bg-white flex-1"}>
      <ScreenHeader
        title={"Consultation"}
        right={appointment && <StatusChip appointment={appointment} />}
        bordered={true}
      />
      {!appointment ? (
        <View className={"flex-1 items-center justify-center px-8"}>
          {isError ? (
            <Pressable onPress={() => refetch()} accessibilityRole={"button"}>
              <Body className={"text-greyColor text-center"}>
                Couldn&apos;t load this consultation.{" "}
                <Label className={"text-primaryColor"}>Try again</Label>
              </Body>
            </Pressable>
          ) : (
            <ActivityIndicator color={theme.primaryColor} />
          )}
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
          <AppointmentCard appointment={appointment} viewer={"MIDWIFE"} />
          <View className={"bg-[#0F969C0D] border border-[#0F969C33] rounded-xl p-4"}>
            <Caption className={"text-greyColor"}>Concern</Caption>
            <Label className={"text-mainText mt-0.5"}>{concernLabel(appointment.concern)}</Label>
            {appointment.notes ? (
              <>
                <Caption className={"text-greyColor mt-3"}>Notes from the patient</Caption>
                <Body className={"text-mainText mt-0.5"}>{appointment.notes}</Body>
              </>
            ) : null}
          </View>
          <JoinCallButton appointment={appointment} />
        </ScrollView>
      )}
    </View>
  );
}

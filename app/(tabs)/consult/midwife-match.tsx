import { View, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Body,
  ButtonText,
  Caption,
  Label,
  PageTitle,
} from "@/components/Typography";
import { AppointmentInfoRows, MidwifeHeader } from "@/components/AppointmentSummary";
import { HoldCountdown } from "@/components/HoldCountdown";
import { IconBadge } from "@/components/icons/IconBadge";
import { holdSecondsLeft } from "@/lib/appointments/status";
import { useNow } from "@/lib/useNow";
import {
  reactToBookingError,
  useAppointment,
  useCancelAppointment,
} from "@/viewmodel/useAppointments";

export default function MidwifeMatchPage() {
  const router = useRouter();
  const { appointmentId } = useLocalSearchParams<{ appointmentId: string }>();
  const id = Number(appointmentId);
  const { data: appointment } = useAppointment(id);
  const release = useCancelAppointment(id);
  const now = useNow();

  if (!appointment?.midwife) {
    return (
      <View className={"bg-white flex-1 items-center justify-center"}>
        <ActivityIndicator color={"#0F969C"} />
      </View>
    );
  }

  const { midwife } = appointment;
  const holdActive = holdSecondsLeft(appointment, now) > 0;

  const handleConfirmBooking = () => {
    router.push({
      pathname: "/consult/checkout",
      params: { appointmentId: String(appointment.id) },
    });
  };

  return (
    <View className={"bg-white flex-1"}>
      <ScrollView className={"flex-1"} contentContainerStyle={{ paddingBottom: 24 }}>
        <View className={"items-center px-8 pt-16"}>
          <IconBadge name={"check-circle"} size={"lg"} />
          <PageTitle className={"text-mainText mt-4 text-center"}>
            We found a midwife for you
          </PageTitle>
          <Body className={"text-greyColor mt-2 text-center leading-5"}>
            Based on your preferences and availability
          </Body>
        </View>

        <View className={"px-4 mt-6"}>
          <View className={"bg-white rounded-xl border border-borderGreyColor p-4"}>
            <MidwifeHeader midwife={midwife} />

            <View
              className={
                "flex-row items-center mt-4 pt-4 border-t border-borderGreyColor gap-3"
              }
            >
              <IconBadge name={"award"} size={"sm"} />
              <View className={"flex-1"}>
                <Caption className={"text-greyColor"}>Experience</Caption>
                <Label className={"text-mainText mt-0.5"}>
                  {midwife.years_of_experience} years
                </Label>
              </View>
            </View>

            {midwife.specialties.length > 0 && (
              <View className={"flex-row flex-wrap gap-2 mt-4"}>
                {midwife.specialties.map((specialty) => (
                  <View key={specialty.code} className={"bg-[#0F969C1A] rounded-full px-3 py-1"}>
                    <Caption className={"text-primaryColor"}>{specialty.label}</Caption>
                  </View>
                ))}
              </View>
            )}

            {midwife.languages.length > 0 && (
              <View className={"flex-row items-center flex-wrap gap-2 mt-3"}>
                <IconBadge name={"languages"} size={"sm"} tone={"neutral"} />
                {midwife.languages.map((language) => (
                  <View
                    key={language}
                    className={"border border-borderGreyColor rounded-full px-3 py-1"}
                  >
                    <Caption className={"text-mainText"}>{language}</Caption>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        <View className={"px-4 mt-4"}>
          <View className={"bg-[#0F969C0D] border border-[#0F969C33] rounded-xl p-4 gap-4"}>
            <Label className={"text-primaryColor"}>Appointment Details</Label>
            <AppointmentInfoRows appointment={appointment} />
          </View>
        </View>

        {appointment.status === "MATCHED" && (
          <View className={"px-4 mt-4"}>
            <HoldCountdown appointment={appointment} />
          </View>
        )}
      </ScrollView>

      <View className={"px-4 py-4"}>
        {holdActive ? (
          <>
            <Pressable
              onPress={handleConfirmBooking}
              accessibilityRole={"button"}
              className={
                "bg-primaryColor rounded-full py-4 items-center justify-center active:opacity-80"
              }
            >
              <ButtonText className={"text-white"}>Confirm Booking</ButtonText>
            </Pressable>
            <Pressable
              onPress={() =>
                release.mutate(undefined, {
                  onSuccess: () => router.replace("/consult"),
                  onError: (error) => reactToBookingError(error, "Couldn't release this slot"),
                })
              }
              disabled={release.isPending}
              accessibilityRole={"button"}
              className={"py-3 items-center"}
            >
              <Label className={"text-greyColor"}>
                {release.isPending ? "Releasing..." : "Not now, release this slot"}
              </Label>
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={() =>
              router.replace({
                pathname: "/consult/match-preferences",
                params: { concern: appointment.concern },
              })
            }
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

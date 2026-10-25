import { View, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { toast } from "sonner-native";
import { Icon } from "@/components/icons/Icon";
import { IconBadge } from "@/components/icons/IconBadge";
import { theme } from "@/constants/theme";
import {
  Body,
  ButtonText,
  Label,
  PageTitle,
} from "@/components/Typography";
import { AppointmentCard } from "@/components/AppointmentSummary";
import { useAppointment } from "@/viewmodel/useAppointments";

export default function BookingConfirmationPage() {
  const router = useRouter();
  const { appointmentId } = useLocalSearchParams<{ appointmentId: string }>();
  const { data: appointment } = useAppointment(Number(appointmentId));

  const handleAddToCalendar = () => {
    toast("Calendar integration coming soon");
  };

  const handleViewAppointment = () => {
    router.push({
      pathname: "/consult/appointment",
      params: { appointmentId },
    });
  };

  return (
    <View className={"bg-white flex-1"}>
      <ScrollView className={"flex-1"} contentContainerStyle={{ paddingBottom: 24 }}>
        <View className={"items-center px-8 pt-16"}>
          <IconBadge name={"calendar-check"} size={"lg"} />
          <PageTitle className={"text-mainText mt-4 text-center"}>
            Consultation Booked 🎉
          </PageTitle>
          <Body className={"text-greyColor mt-2 text-center leading-5"}>
            Your consultation has been successfully scheduled. We&apos;ll send
            you a reminder before your session.
          </Body>
        </View>

        <View className={"px-4 mt-6"}>
          {appointment ? (
            <AppointmentCard appointment={appointment} />
          ) : (
            <ActivityIndicator color={"#0F969C"} />
          )}
        </View>

        <View className={"px-4 mt-4"}>
          <View
            className={
              "bg-[#0F969C0D] border border-[#0F969C33] rounded-xl p-4 flex-row items-start gap-3"
            }
          >
            <Icon name={"bell"} size={18} color={theme.primaryColor} />
            <Body className={"text-subText leading-5 flex-1"}>
              You&apos;ll receive reminders 1 hour and 30 minutes before your
              appointment.
            </Body>
          </View>
        </View>
      </ScrollView>

      <View className={"px-4 py-4 gap-3"}>
        <Pressable
          onPress={handleAddToCalendar}
          accessibilityRole={"button"}
          className={
            "bg-white border-2 border-primaryColor rounded-full py-4 flex-row items-center justify-center gap-2 active:opacity-80"
          }
        >
          <Icon name={"calendar"} size={18} color={theme.primaryColor} />
          <ButtonText className={"text-primaryColor"}>
            Add to Calendar
          </ButtonText>
        </Pressable>
        <Pressable
          onPress={handleViewAppointment}
          accessibilityRole={"button"}
          className={
            "bg-primaryColor rounded-full py-4 items-center justify-center active:opacity-80"
          }
        >
          <ButtonText className={"text-white"}>View Appointment</ButtonText>
        </Pressable>
        <Pressable
          onPress={() => router.push("/home")}
          accessibilityRole={"button"}
          className={"py-2 items-center justify-center"}
        >
          <Label className={"text-greyColor"}>
            Return to Home
          </Label>
        </Pressable>
      </View>
    </View>
  );
}

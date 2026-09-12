import { View, Pressable, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { addMinutes, format, parse, parseISO } from "date-fns";
import { toast } from "sonner-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Midwife, midwives } from "@/constants/midwives";
import {
  Body,
  ButtonText,
  CardTitle,
  Caption,
  Label,
  PageTitle,
} from "@/components/Typography";

const CONSULTATION_TYPE_LABELS: Record<string, string> = {
  chat: "Chat Consultation",
  audio: "Audio Call",
  video: "Video Call",
};

const CONSULTATION_TYPE_ICONS: Record<
  string,
  React.ComponentProps<typeof Ionicons>["name"]
> = {
  chat: "chatbubble-outline",
  audio: "call-outline",
  video: "videocam-outline",
};

const DEFAULT_DURATION_MINUTES: Record<string, number> = {
  chat: 30,
  audio: 45,
  video: 30,
};

function getDurationMinutes(midwife: Midwife, consultationType: string) {
  const match = midwife.consultationTypes.find(
    (type) => type.key === consultationType,
  );
  const parsed = match ? parseInt(match.duration, 10) : NaN;
  if (!Number.isNaN(parsed)) return parsed;
  return DEFAULT_DURATION_MINUTES[consultationType] ?? 30;
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
}) {
  return (
    <View
      className={
        "flex-row items-center gap-3 bg-white rounded-xl border border-borderGreyColor px-4 py-3"
      }
    >
      <View
        className={
          "w-9 h-9 rounded-full bg-[#0F969C1A] items-center justify-center"
        }
      >
        <Ionicons name={icon} size={18} color={"#0F969C"} />
      </View>
      <View>
        <Caption className={"text-greyColor"}>{label}</Caption>
        <Label className={"text-mainText mt-0.5"}>
          {value}
        </Label>
      </View>
    </View>
  );
}

export default function BookingConfirmationPage() {
  const router = useRouter();
  const { topic, consultationType, date, time, midwifeId } =
    useLocalSearchParams<{
      topic: string;
      consultationType: string;
      date: string;
      time: string;
      midwifeId: string;
    }>();

  const midwife = midwives.find((item) => item.id === midwifeId) ?? midwives[0];
  const avatarUri = `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${midwife.name}&size=48&backgroundColor=d1d4f9`;
  const typeLabel = CONSULTATION_TYPE_LABELS[consultationType] ?? "Consultation";
  const typeIcon = CONSULTATION_TYPE_ICONS[consultationType] ?? "chatbubble-outline";

  const formattedDate = date ? format(parseISO(date), "EEEE, d MMMM yyyy") : "";

  let timeRange = time;
  if (time) {
    const start = parse(time, "hh:mm a", new Date());
    if (!Number.isNaN(start.getTime())) {
      const end = addMinutes(start, getDurationMinutes(midwife, consultationType));
      timeRange = `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
    }
  }

  const handleAddToCalendar = () => {
    toast("Calendar integration coming soon");
  };

  const handleViewAppointment = () => {
    router.push({
      pathname: "/consult/appointment",
      params: { topic, consultationType, date, time, midwifeId },
    });
  };

  return (
    <View className={"bg-white flex-1"}>
      <ScrollView className={"flex-1"} contentContainerStyle={{ paddingBottom: 24 }}>
        <View className={"items-center px-8 pt-16"}>
          <View
            className={
              "w-16 h-16 rounded-full bg-[#0F969C1A] items-center justify-center"
            }
          >
            <Ionicons name={"checkmark-circle"} size={40} color={"#0F969C"} />
          </View>
          <PageTitle className={"text-mainText mt-4 text-center"}>
            Consultation Booked 🎉
          </PageTitle>
          <Body className={"text-greyColor mt-2 text-center leading-5"}>
            Your consultation has been successfully scheduled. We&apos;ll send
            you a reminder before your session.
          </Body>
        </View>

        <View className={"px-4 mt-6"}>
          <View
            className={"bg-white rounded-xl border border-borderGreyColor p-4"}
          >
            <View className={"flex-row items-center gap-3"}>
              <View
                className={
                  "rounded-full overflow-hidden w-12 h-12 bg-[#0F969C1A]"
                }
              >
                <Image
                  source={{ uri: avatarUri }}
                  style={{ width: 48, height: 48 }}
                />
              </View>
              <View>
                <View className={"flex-row items-center gap-1.5"}>
                  <CardTitle className={"text-mainText"}>
                    {midwife.name}
                  </CardTitle>
                  <Ionicons
                    name={"checkmark-circle"}
                    size={16}
                    color={"#0F969C"}
                  />
                </View>
                <Caption className={"text-greyColor mt-0.5"}>
                  {midwife.role}
                </Caption>
              </View>
            </View>

            <View className={"mt-4 gap-3"}>
              <InfoRow icon={"calendar-outline"} label={"Date"} value={formattedDate} />
              <InfoRow icon={"time-outline"} label={"Time"} value={timeRange} />
              <InfoRow icon={typeIcon} label={"Type"} value={typeLabel} />
            </View>
          </View>
        </View>

        <View className={"px-4 mt-4"}>
          <View
            className={
              "bg-[#FFF8E1] border border-[#F5C542] rounded-xl px-4 py-3"
            }
          >
            <Body className={"text-[#8A6D1D] leading-5"}>
              You&apos;ll receive reminders 1 hour and 30 minutes before your
              appointment.
            </Body>
          </View>
        </View>
      </ScrollView>

      <View className={"px-4 py-4 gap-3"}>
        <Pressable
          onPress={handleAddToCalendar}
          className={
            "bg-white border-2 border-primaryColor rounded-full py-4 flex-row items-center justify-center gap-2 active:opacity-80"
          }
        >
          <Ionicons name={"calendar-outline"} size={18} color={"#0F969C"} />
          <ButtonText className={"text-primaryColor"}>
            Add to Calendar
          </ButtonText>
        </Pressable>
        <Pressable
          onPress={handleViewAppointment}
          className={
            "bg-primaryColor rounded-full py-4 items-center justify-center active:opacity-80"
          }
        >
          <ButtonText className={"text-white"}>View Appointment</ButtonText>
        </Pressable>
        <Pressable
          onPress={() => router.push("/home")}
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

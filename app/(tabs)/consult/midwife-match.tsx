import { View, Pressable, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { addMinutes, format, parse, parseISO } from "date-fns";
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

function AppointmentDetailRow({
  icon,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  value: string;
}) {
  return (
    <View className={"flex-row items-center gap-2"}>
      <Ionicons name={icon} size={16} color={"#0F969C"} />
      <Label className={"text-mainText"}>{value}</Label>
    </View>
  );
}

export default function MidwifeMatchPage() {
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

  const handleConfirmBooking = () => {
    router.push({
      pathname: "/consult/checkout",
      params: { topic, consultationType, date, time, midwifeId },
    });
  };

  return (
    <View className={"bg-white flex-1"}>
      <ScrollView className={"flex-1"} contentContainerStyle={{ paddingBottom: 24 }}>
        <View className={"items-center px-8 pt-16"}>
          <View
            className={
              "w-16 h-16 rounded-full bg-green-500 items-center justify-center"
            }
          >
            <Ionicons name={"checkmark"} size={32} color={"#fff"} />
          </View>
          <PageTitle className={"text-mainText mt-4 text-center"}>
            We found a midwife for you
          </PageTitle>
          <Body className={"text-greyColor mt-2 text-center leading-5"}>
            Based on your preferences and availability
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

            <View
              className={
                "flex-row items-start justify-between mt-4 pt-4 border-t border-borderGreyColor"
              }
            >
              <View className={"items-center flex-1"}>
                <Label className={"text-mainText"}>
                  {midwife.yearsExperience} Years
                </Label>
                <Caption className={"text-greyColor mt-0.5"}>
                  Experience
                </Caption>
              </View>
              <View className={"w-px h-10 bg-borderGreyColor"} />
              <View className={"items-center flex-1 px-2"}>
                <Label className={"text-mainText text-center"}>
                  {midwife.specialty}
                </Label>
                <Caption className={"text-greyColor mt-0.5"}>
                  Specialty
                </Caption>
              </View>
            </View>

            <View
              className={
                "flex-row items-center flex-wrap gap-2 mt-4 pt-4 border-t border-borderGreyColor"
              }
            >
              <Body className={"text-greyColor"}>Languages:</Body>
              {midwife.languages.map((language) => (
                <View
                  key={language}
                  className={"border border-borderGreyColor rounded-full px-3 py-1"}
                >
                  <Caption className={"text-mainText"}>
                    {language}
                  </Caption>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className={"px-4 mt-4"}>
          <View className={"bg-[#0F969C1A] rounded-xl p-4 gap-3"}>
            <Label className={"text-primaryColor"}>
              Appointment Details
            </Label>
            <AppointmentDetailRow icon={"calendar-outline"} value={formattedDate} />
            <AppointmentDetailRow icon={"time-outline"} value={timeRange} />
            <AppointmentDetailRow icon={typeIcon} value={typeLabel} />
          </View>
        </View>
      </ScrollView>

      <View className={"px-4 py-4"}>
        <Pressable
          onPress={handleConfirmBooking}
          className={
            "bg-primaryColor rounded-full py-4 items-center justify-center active:opacity-80"
          }
        >
          <ButtonText className={"text-white"}>Confirm Booking</ButtonText>
        </Pressable>
      </View>
    </View>
  );
}

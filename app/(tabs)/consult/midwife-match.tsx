import { View, Text, Pressable, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { addMinutes, format, parse, parseISO } from "date-fns";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Midwife, midwives } from "@/constants/midwives";

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
      <Text className={"text-mainText text-sm font-medium"}>{value}</Text>
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
          <Text className={"text-mainText text-xl font-bold mt-4 text-center"}>
            We found a midwife for you
          </Text>
          <Text className={"text-greyColor text-sm mt-2 text-center leading-5"}>
            Based on your preferences and availability
          </Text>
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
                  <Text className={"text-mainText font-bold"}>
                    {midwife.name}
                  </Text>
                  <Ionicons
                    name={"checkmark-circle"}
                    size={16}
                    color={"#0F969C"}
                  />
                </View>
                <Text className={"text-greyColor text-xs mt-0.5"}>
                  {midwife.role}
                </Text>
              </View>
            </View>

            <View
              className={
                "flex-row items-start justify-between mt-4 pt-4 border-t border-borderGreyColor"
              }
            >
              <View className={"items-center flex-1"}>
                <Text className={"text-mainText text-sm font-bold"}>
                  {midwife.yearsExperience} Years
                </Text>
                <Text className={"text-greyColor text-xs mt-0.5"}>
                  Experience
                </Text>
              </View>
              <View className={"w-px h-10 bg-borderGreyColor"} />
              <View className={"items-center flex-1 px-2"}>
                <Text className={"text-mainText text-sm font-bold text-center"}>
                  {midwife.specialty}
                </Text>
                <Text className={"text-greyColor text-xs mt-0.5"}>
                  Specialty
                </Text>
              </View>
            </View>

            <View
              className={
                "flex-row items-center flex-wrap gap-2 mt-4 pt-4 border-t border-borderGreyColor"
              }
            >
              <Text className={"text-greyColor text-sm"}>Languages:</Text>
              {midwife.languages.map((language) => (
                <View
                  key={language}
                  className={"border border-borderGreyColor rounded-full px-3 py-1"}
                >
                  <Text className={"text-mainText text-xs font-medium"}>
                    {language}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className={"px-4 mt-4"}>
          <View className={"bg-[#0F969C1A] rounded-xl p-4 gap-3"}>
            <Text className={"text-primaryColor font-semibold"}>
              Appointment Details
            </Text>
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
          <Text className={"text-white font-semibold"}>Confirm Booking</Text>
        </Pressable>
      </View>
    </View>
  );
}

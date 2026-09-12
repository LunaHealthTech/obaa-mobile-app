import { useEffect, useState } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addMinutes,
  differenceInSeconds,
  format,
  parse,
  parseISO,
} from "date-fns";
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

function pad(value: number) {
  return value.toString().padStart(2, "0");
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

export default function AppointmentPage() {
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
  let sessionStart: Date | null = null;
  if (time) {
    const start = parse(time, "hh:mm a", new Date());
    if (!Number.isNaN(start.getTime())) {
      const end = addMinutes(start, getDurationMinutes(midwife, consultationType));
      timeRange = `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
    }
  }
  if (date && time) {
    const combined = parse(`${date} ${time}`, "yyyy-MM-dd hh:mm a", new Date());
    if (!Number.isNaN(combined.getTime())) sessionStart = combined;
  }

  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    sessionStart ? Math.max(0, differenceInSeconds(sessionStart, new Date())) : 0,
  );

  useEffect(() => {
    if (!sessionStart) return;
    const interval = setInterval(() => {
      setRemainingSeconds(
        Math.max(0, differenceInSeconds(sessionStart!, new Date())),
      );
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, time]);

  const days = Math.floor(remainingSeconds / 86400);
  const hours = Math.floor((remainingSeconds % 86400) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const countdownUnits = [
    { label: "Days", value: days },
    { label: "Hours", value: hours },
    { label: "Min", value: minutes },
    { label: "Sec", value: seconds },
  ];

  const handleCancel = () => {
    toast("Cancellation coming soon");
  };

  const handleReschedule = () => {
    toast("Rescheduling coming soon");
  };

  return (
    <View className={"bg-white flex-1"}>
      <View
        className={
          "flex-row items-center gap-3 px-4 pt-4 pb-4 border-b border-borderGreyColor"
        }
      >
        <Pressable
          onPress={() => router.replace("/consult")}
          className={
            "w-10 h-10 rounded-full border border-borderGreyColor items-center justify-center"
          }
        >
          <Ionicons name={"chevron-back"} size={20} color={"#17252A"} />
        </Pressable>
        <PageTitle className={"text-mainText"}>
          Upcoming Appointment
        </PageTitle>
      </View>

      <ScrollView className={"flex-1"} contentContainerStyle={{ paddingBottom: 24 }}>
        <View className={"px-4 mt-6"}>
          <View className={"bg-[#0F969C0D] rounded-2xl p-4 items-center"}>
            <Body className={"text-greyColor"}>Session starts in</Body>
            <View className={"flex-row gap-3 mt-3"}>
              {countdownUnits.map((unit) => (
                <View
                  key={unit.label}
                  className={
                    "bg-white rounded-xl items-center justify-center w-16 h-16"
                  }
                >
                  <PageTitle className={"text-primaryColor"}>
                    {pad(unit.value)}
                  </PageTitle>
                  <Caption className={"text-greyColor mt-0.5"}>
                    {unit.label}
                  </Caption>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className={"px-4 mt-4"}>
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

        <View className={"px-4 mt-6"}>
          <View
            className={
              "bg-[#F5F7F8] rounded-full py-4 items-center justify-center"
            }
          >
            <Label className={"text-greyColor"}>
              Join Session (Available Soon)
            </Label>
          </View>
        </View>

        <View className={"px-4 mt-4 flex-row gap-3"}>
          <Pressable
            onPress={handleCancel}
            className={
              "flex-1 bg-white border-2 border-red-500 rounded-full py-4 items-center justify-center active:opacity-80"
            }
          >
            <ButtonText className={"text-red-500"}>Cancel</ButtonText>
          </Pressable>
          <Pressable
            onPress={handleReschedule}
            className={
              "flex-1 bg-white border border-borderGreyColor rounded-full py-4 items-center justify-center active:opacity-80"
            }
          >
            <ButtonText className={"text-mainText"}>Reschedule</ButtonText>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

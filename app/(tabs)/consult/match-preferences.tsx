import { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { addDays, format } from "date-fns";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const supportTopics = [
  "Pregnancy Support",
  "Missed Period",
  "Menstrual Concerns",
  "Teen Health",
  "Symptoms",
  "Emotional Support",
];

const consultationTypes = [
  { key: "chat", label: "Chat", icon: "comment" as const },
  { key: "audio", label: "Audio Call", icon: "phone" as const },
  { key: "video", label: "Video Call", icon: "video-camera" as const },
];

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

const unavailableTimeSlots = ["10:00 AM", "03:00 PM"];

const upcomingDays = Array.from({ length: 10 }, (_, index) => {
  const date = addDays(new Date(), index);
  return {
    iso: format(date, "yyyy-MM-dd"),
    weekday: format(date, "EEE"),
    day: format(date, "d"),
  };
});

export default function MatchPreferencesPage() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState(supportTopics[1]);
  const [consultationType, setConsultationType] = useState("chat");
  const [selectedDay, setSelectedDay] = useState(upcomingDays[0].iso);
  const [selectedTime, setSelectedTime] = useState("09:00 AM");
  const [notes, setNotes] = useState("");

  const handleFindMidwife = () => {
    router.push({
      pathname: "/consult/finding-midwife",
      params: {
        topic: selectedTopic,
        consultationType,
        date: selectedDay,
        time: selectedTime,
      },
    });
  };

  return (
    <ScrollView className={"bg-white flex-1"}>
      <View className={"flex-row items-start gap-3 px-4 pt-4"}>
        <Pressable
          onPress={() => router.back()}
          className={
            "w-10 h-10 rounded-full border border-borderGreyColor items-center justify-center"
          }
        >
          <Ionicons name={"chevron-back"} size={20} color={"#17252A"} />
        </Pressable>
        <View className={"flex-1 mt-1"}>
          <Text className={"text-mainText text-xl font-bold"}>
            Let&apos;s find the right support
          </Text>
          <Text className={"text-greyColor text-sm mt-1"}>
            Tell us what you need and we&apos;ll handle the rest.
          </Text>
        </View>
      </View>

      <View className={"px-4 mt-6"}>
        <Text className={"text-mainText font-semibold mb-3"}>
          What do you need support with?
        </Text>
        <View className={"flex-row flex-wrap gap-2"}>
          {supportTopics.map((topic) => {
            const isSelected = topic === selectedTopic;
            return (
              <Pressable
                key={topic}
                onPress={() => setSelectedTopic(topic)}
                className={
                  isSelected
                    ? "bg-primaryColor rounded-full px-4 py-2"
                    : "bg-white border border-borderGreyColor rounded-full px-4 py-2"
                }
              >
                <Text
                  className={
                    isSelected
                      ? "text-white text-sm font-medium"
                      : "text-mainText text-sm font-medium"
                  }
                >
                  {topic}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className={"px-4 mt-6"}>
        <Text className={"text-mainText font-semibold mb-3"}>
          Consultation Type
        </Text>
        <View className={"flex-row gap-3"}>
          {consultationTypes.map((type) => {
            const isSelected = type.key === consultationType;
            return (
              <Pressable
                key={type.key}
                onPress={() => setConsultationType(type.key)}
                className={
                  isSelected
                    ? "flex-1 bg-[#0F969C1A] border-2 border-primaryColor rounded-xl py-5 items-center gap-2"
                    : "flex-1 bg-white border border-borderGreyColor rounded-xl py-5 items-center gap-2"
                }
              >
                <FontAwesome
                  name={type.icon}
                  size={22}
                  color={isSelected ? "#0F969C" : "#72777A"}
                />
                <Text
                  className={
                    isSelected
                      ? "text-primaryColor text-sm font-medium"
                      : "text-greyColor text-sm font-medium"
                  }
                >
                  {type.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className={"mt-6"}>
        <Text className={"text-mainText font-semibold mb-3 px-4"}>
          Preferred day
        </Text>
        <FlatList
          horizontal={true}
          data={upcomingDays}
          keyExtractor={(item) => item.iso}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}
          renderItem={({ item }) => {
            const isSelected = item.iso === selectedDay;
            return (
              <Pressable
                onPress={() => setSelectedDay(item.iso)}
                className={
                  isSelected
                    ? "bg-primaryColor rounded-xl items-center justify-center w-14 h-16"
                    : "bg-white border border-borderGreyColor rounded-xl items-center justify-center w-14 h-16"
                }
              >
                <Text
                  className={
                    isSelected
                      ? "text-white text-xs"
                      : "text-greyColor text-xs"
                  }
                >
                  {item.weekday}
                </Text>
                <Text
                  className={
                    isSelected
                      ? "text-white text-lg font-semibold mt-1"
                      : "text-mainText text-lg font-semibold mt-1"
                  }
                >
                  {item.day}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      <View className={"px-4 mt-6"}>
        <Text className={"text-mainText font-semibold mb-3"}>
          Preferred time
        </Text>
        <View className={"flex-row flex-wrap gap-2"}>
          {timeSlots.map((time) => {
            const isUnavailable = unavailableTimeSlots.includes(time);
            const isSelected = time === selectedTime;
            return (
              <Pressable
                key={time}
                disabled={isUnavailable}
                onPress={() => setSelectedTime(time)}
                className={
                  isSelected
                    ? "bg-primaryColor rounded-full px-4 py-2"
                    : isUnavailable
                      ? "bg-[#F5F7F8] rounded-full px-4 py-2"
                      : "bg-white border border-borderGreyColor rounded-full px-4 py-2"
                }
              >
                <Text
                  className={
                    isSelected
                      ? "text-white text-sm font-medium"
                      : isUnavailable
                        ? "text-greyColor text-sm font-medium line-through"
                        : "text-mainText text-sm font-medium"
                  }
                >
                  {time}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className={"px-4 mt-6"}>
        <Text className={"text-mainText font-semibold mb-3"}>
          Additional Notes <Text className={"text-greyColor font-normal"}>(optional)</Text>
        </Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          multiline={true}
          numberOfLines={4}
          placeholder={"Briefly describe what you need help with..."}
          placeholderTextColor={"#72777A"}
          className={
            "border border-borderGreyColor rounded-xl p-4 text-mainText h-24"
          }
          textAlignVertical={"top"}
        />
      </View>

      <View className={"px-4 mt-6"}>
        <Pressable
          onPress={handleFindMidwife}
          className={
            "bg-primaryColor rounded-full py-4 items-center justify-center active:opacity-80"
          }
        >
          <Text className={"text-white font-semibold"}>Find My Midwife</Text>
        </Pressable>
      </View>

      <View className={"h-10"} />
    </ScrollView>
  );
}

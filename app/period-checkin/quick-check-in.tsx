import { View, Text, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { usePeriodCheckInStore } from "@/repositories/usePeriodCheckInStore";

export default function QuickCheckIn() {
  const router = useRouter();
  const { date, cycleId } = useLocalSearchParams<{
    date: string;
    cycleId?: string;
  }>();
  const start = usePeriodCheckInStore((s) => s.start);

  const onYes = () => {
    start({
      mode: "confirm",
      date,
      cycleId: cycleId ? Number(cycleId) : null,
    });
    router.push("/period-checkin/date");
  };

  return (
    <View className="bg-white items-center px-8 py-8">
      <View className="w-20 h-20 rounded-full bg-[#0F969C1A] items-center justify-center mb-6">
        <Ionicons name="calendar" size={32} color="#0F969C" />
      </View>
      <Text className="text-xl font-semibold text-mainText text-center">
        🌸 Quick Check-In
      </Text>
      <Text className="text-subText text-center mt-2 mb-8">
        We just want to make sure your tracking stays accurate 💕
      </Text>
      <Text className="font-semibold text-mainText text-center mb-6">
        Have you started your period or noticed any bleeding today?
      </Text>
      <Pressable
        onPress={onYes}
        className="border-2 border-primaryColor rounded-full w-full py-4 items-center mb-3"
      >
        <Text className="text-primaryColor font-semibold">
          🩸 Yes, I'm seeing blood
        </Text>
      </Pressable>
      <Pressable
        onPress={() => router.push("/period-checkin/not-yet")}
        className="border-2 border-borderGreyColor rounded-full w-full py-4 items-center"
      >
        <Text className="text-mainText font-semibold">🌿 No, Not yet</Text>
      </Pressable>
    </View>
  );
}

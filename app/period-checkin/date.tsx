import { View, Text, Pressable } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Calendar } from "react-native-calendars";
import { format } from "date-fns";
import { usePeriodCheckInStore } from "@/repositories/usePeriodCheckInStore";

export default function PeriodStartDate() {
  const router = useRouter();
  const { date, setDate } = usePeriodCheckInStore();
  const [selected, setSelected] = useState(
    date || format(new Date(), "yyyy-MM-dd"),
  );

  const onConfirm = () => {
    setDate(selected);
    router.push("/period-checkin/flow-intensity");
  };

  return (
    <View className="bg-white px-6 pt-8 pb-8">
      <Text className="text-subText text-center">Step 1 of 3</Text>
      <Text className="text-xl font-semibold text-mainText text-center mt-1 mb-1">
        🌸 When did it start?
      </Text>
      <Text className="text-subText text-center mb-4">
        Select the first day you noticed bleeding. We'll use this to keep
        your cycle in sync 💕
      </Text>
      <Calendar
        current={selected}
        maxDate={format(new Date(), "yyyy-MM-dd")}
        onDayPress={(day) => setSelected(day.dateString)}
        markedDates={{
          [selected]: { selected: true, selectedColor: "#0F969C" },
        }}
      />
      <Pressable
        onPress={onConfirm}
        className="bg-primaryColor rounded-full py-4 items-center mt-6"
      >
        <Text className="text-white font-semibold">Confirm Date</Text>
      </Pressable>
    </View>
  );
}

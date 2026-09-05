import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { usePeriodCheckInStore } from "@/repositories/usePeriodCheckInStore";

const INTENSITIES = ["Light", "Medium", "Heavy", "Spotting"];

export default function FlowIntensity() {
  const router = useRouter();
  const { flowIntensity, setFlowIntensity } = usePeriodCheckInStore();

  return (
    <View className="bg-white px-6 pt-8 pb-8">
      <Text className="text-subText text-center">Step 2 of 3</Text>
      <Text className="text-xl font-semibold text-mainText text-center mt-1 mb-1">
        🩸 Flow Intensity
      </Text>
      <Text className="text-subText text-center mb-6">
        How would you describe your flow today? There's no right answer,
        every body is different.
      </Text>
      {INTENSITIES.map((intensity) => {
        const isSelected = flowIntensity === intensity;
        return (
          <Pressable
            key={intensity}
            onPress={() => setFlowIntensity(intensity)}
            className={`rounded-full py-4 items-center mb-3 border-2 ${
              isSelected ? "border-primaryColor" : "border-borderGreyColor"
            }`}
          >
            <Text
              className={
                isSelected ? "text-primaryColor font-semibold" : "text-mainText"
              }
            >
              {intensity}
            </Text>
          </Pressable>
        );
      })}
      <Pressable
        onPress={() => router.push("/period-checkin/symptoms")}
        className="bg-primaryColor rounded-full py-4 items-center mt-4"
      >
        <Text className="text-white font-semibold">Continue</Text>
      </Pressable>
    </View>
  );
}

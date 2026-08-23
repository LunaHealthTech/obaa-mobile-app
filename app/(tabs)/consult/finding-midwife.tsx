import { useEffect } from "react";
import { View, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";
import { midwives } from "@/constants/midwives";

type StepStatus = "done" | "active" | "pending";

const steps: { key: string; label: string; status: StepStatus }[] = [
  { key: "specialty", label: "Matching specialty", status: "done" },
  { key: "availability", label: "Checking availability", status: "active" },
  { key: "appointment", label: "Preparing appointment", status: "pending" },
];

export default function FindingMidwifePage() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    topic: string;
    consultationType: string;
    date: string;
    time: string;
  }>();
  const outerScale = useSharedValue(1);
  const middleScale = useSharedValue(1);
  const dotOpacity = useSharedValue(1);

  useEffect(() => {
    const pulse = (scale: number) =>
      withRepeat(
        withSequence(
          withTiming(scale, { duration: 900, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 900, easing: Easing.in(Easing.ease) }),
        ),
        -1,
      );

    outerScale.value = pulse(1.15);
    middleScale.value = pulse(1.12);
    dotOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 700 }),
        withTiming(1, { duration: 700 }),
      ),
      -1,
    );
  }, [outerScale, middleScale, dotOpacity]);

  useEffect(() => {
    // Simulated matching delay — replace with real matching-status polling
    // once the backend endpoint exists.
    const timeout = setTimeout(() => {
      const matched = midwives[Math.floor(Math.random() * midwives.length)];
      router.replace({
        pathname: "/consult/midwife-match",
        params: { ...params, midwifeId: matched.id },
      });
    }, 2500);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const outerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: outerScale.value }],
  }));
  const middleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: middleScale.value }],
  }));
  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  return (
    <View className={"bg-white flex-1 items-center justify-center px-8"}>
      <Animated.View
        style={outerStyle}
        className={
          "w-48 h-48 rounded-full bg-[#0F969C0D] items-center justify-center"
        }
      >
        <Animated.View
          style={middleStyle}
          className={
            "w-32 h-32 rounded-full bg-[#0F969C33] items-center justify-center"
          }
        >
          <View className={"w-16 h-16 rounded-full bg-primaryColor"} />
        </Animated.View>
      </Animated.View>

      <Text className={"text-mainText text-lg font-bold mt-8"}>
        Finding your midwife...
      </Text>
      <Text className={"text-greyColor text-sm mt-1"}>
        This can take up to a minute
      </Text>

      <View className={"w-full mt-10 gap-4"}>
        {steps.map((step) => (
          <View key={step.key} className={"flex-row items-center gap-3"}>
            {step.status === "done" && (
              <View
                className={
                  "w-6 h-6 rounded-full bg-primaryColor items-center justify-center"
                }
              >
                <Ionicons name={"checkmark"} size={14} color={"#fff"} />
              </View>
            )}
            {step.status === "active" && (
              <View
                className={
                  "w-6 h-6 rounded-full border-2 border-primaryColor items-center justify-center"
                }
              >
                <Animated.View
                  style={dotStyle}
                  className={"w-2.5 h-2.5 rounded-full bg-primaryColor"}
                />
              </View>
            )}
            {step.status === "pending" && (
              <View className={"w-6 h-6 rounded-full bg-[#F5F7F8]"} />
            )}
            <Text
              className={
                step.status === "pending"
                  ? "text-greyColor text-base"
                  : "text-mainText text-base"
              }
            >
              {step.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

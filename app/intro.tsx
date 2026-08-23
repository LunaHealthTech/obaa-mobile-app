import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useAuthStore } from "@/repositories/useAuthStore";
import { AnimatedLogo } from "@/components/splash/AnimatedLogo";

export default function Intro() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const insets = useSafeAreaInsets();

  const [entranceComplete, setEntranceComplete] = useState(false);

  const showCta = status === "unauthenticated" && entranceComplete;

  const ctaOpacity = useSharedValue(0);
  const ctaTranslateY = useSharedValue(16);
  useEffect(() => {
    if (!showCta) return;
    ctaOpacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
    ctaTranslateY.value = withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCta]);
  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ translateY: ctaTranslateY.value }],
  }));

  return (
    <View
      className="flex-1 bg-primaryColor items-center justify-between"
      style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }}
    >
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <AnimatedLogo
          variant="pulse"
          size={120}
          onEntranceComplete={() => setEntranceComplete(true)}
        />
        <View className="items-center gap-1 mt-2">
          <Text className="text-white text-3xl font-bold">Obaa</Text>
          <Text className="text-white/80 text-sm">by Ergon Pulse</Text>
        </View>
      </View>

      <Animated.View
        style={ctaStyle}
        pointerEvents={showCta ? "auto" : "none"}
        className="w-full items-center gap-4 px-8"
      >
        <Pressable
          onPress={() => router.push("/signin")}
          className="bg-white w-full max-w-[360px] h-[62px] rounded-full items-center justify-center active:opacity-80"
        >
          <Text className="text-primaryColor text-lg font-semibold">
            Sign In
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/signup")}
          className="bg-[rgba(255,255,255,0.15)] border-2 border-white w-full max-w-[360px] h-[62px] rounded-full items-center justify-center active:opacity-80"
        >
          <Text className="text-white text-lg font-semibold">Register</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

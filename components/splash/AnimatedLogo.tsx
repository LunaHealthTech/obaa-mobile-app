import { useEffect } from "react";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { ObaaMark } from "@/components/splash/ObaaMark";

export type SplashVariant =
  | "fade-scale"
  | "pulse"
  | "rotate-in"
  | "stagger-assemble"
  | "slide-bounce";

export const SPLASH_VARIANTS: { key: SplashVariant; label: string }[] = [
  { key: "fade-scale", label: "Fade + Scale" },
  { key: "pulse", label: "Pulse" },
  { key: "rotate-in", label: "Rotate In" },
  { key: "stagger-assemble", label: "Stagger Assemble" },
  { key: "slide-bounce", label: "Slide + Bounce" },
];

interface VariantProps {
  size: number;
  onEntranceComplete?: () => void;
}

function FadeScaleLogo({ size, onEntranceComplete }: VariantProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.85);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
    scale.value = withTiming(
      1,
      { duration: 900, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished && onEntranceComplete) runOnJS(onEntranceComplete)();
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={style}>
      <ObaaMark size={size} />
    </Animated.View>
  );
}

function PulseLogo({ size, onEntranceComplete }: VariantProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.85);

  useEffect(() => {
    opacity.value = withTiming(
      1,
      { duration: 700, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished && onEntranceComplete) runOnJS(onEntranceComplete)();
      },
    );
    scale.value = withSequence(
      withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }),
      withRepeat(
        withSequence(
          withTiming(1.05, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={style}>
      <ObaaMark size={size} />
    </Animated.View>
  );
}

function RotateInLogo({ size, onEntranceComplete }: VariantProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.85);
  const rotate = useSharedValue(-12);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
    scale.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
    rotate.value = withTiming(
      0,
      { duration: 1000, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished && onEntranceComplete) runOnJS(onEntranceComplete)();
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  return (
    <Animated.View style={style}>
      <ObaaMark size={size} />
    </Animated.View>
  );
}

function StaggerAssembleLogo({ size, onEntranceComplete }: VariantProps) {
  const opacity1 = useSharedValue(0);
  const opacity2 = useSharedValue(0);
  const opacity3 = useSharedValue(0);
  const y1 = useSharedValue(18);
  const y2 = useSharedValue(18);
  const y3 = useSharedValue(18);

  useEffect(() => {
    const stagger = 130;
    const duration = 550;
    const easing = Easing.out(Easing.cubic);

    opacity1.value = withDelay(0, withTiming(1, { duration, easing }));
    y1.value = withDelay(0, withTiming(0, { duration, easing }));

    opacity2.value = withDelay(stagger, withTiming(1, { duration, easing }));
    y2.value = withDelay(stagger, withTiming(0, { duration, easing }));

    opacity3.value = withDelay(
      stagger * 2,
      withTiming(1, { duration, easing }, (finished) => {
        if (finished && onEntranceComplete) runOnJS(onEntranceComplete)();
      }),
    );
    y3.value = withDelay(stagger * 2, withTiming(0, { duration, easing }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedProps1 = useAnimatedProps(() => ({
    opacity: opacity1.value,
    transform: [{ translateY: y1.value }],
  }));
  const animatedProps2 = useAnimatedProps(() => ({
    opacity: opacity2.value,
    transform: [{ translateY: y2.value }],
  }));
  const animatedProps3 = useAnimatedProps(() => ({
    opacity: opacity3.value,
    transform: [{ translateY: y3.value }],
  }));

  return (
    <ObaaMark
      size={size}
      pathAnimatedProps={[animatedProps1, animatedProps2, animatedProps3]}
    />
  );
}

function SlideBounceLogo({ size, onEntranceComplete }: VariantProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(40);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
    translateY.value = withSpring(
      0,
      { damping: 8, stiffness: 120, mass: 0.9 },
      (finished) => {
        if (finished && onEntranceComplete) runOnJS(onEntranceComplete)();
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={style}>
      <ObaaMark size={size} />
    </Animated.View>
  );
}

interface AnimatedLogoProps {
  variant: SplashVariant;
  size?: number;
  onEntranceComplete?: () => void;
}

export function AnimatedLogo({
  variant,
  size = 96,
  onEntranceComplete,
}: AnimatedLogoProps) {
  switch (variant) {
    case "fade-scale":
      return (
        <FadeScaleLogo size={size} onEntranceComplete={onEntranceComplete} />
      );
    case "pulse":
      return <PulseLogo size={size} onEntranceComplete={onEntranceComplete} />;
    case "rotate-in":
      return (
        <RotateInLogo size={size} onEntranceComplete={onEntranceComplete} />
      );
    case "stagger-assemble":
      return (
        <StaggerAssembleLogo
          size={size}
          onEntranceComplete={onEntranceComplete}
        />
      );
    case "slide-bounce":
      return (
        <SlideBounceLogo size={size} onEntranceComplete={onEntranceComplete} />
      );
  }
}

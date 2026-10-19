import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Body,
  ButtonText,
  CardTitle,
  SectionHeading,
} from "@/components/Typography";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Icon, type IconName } from "@/components/icons/Icon";
import { IconBadge } from "@/components/icons/IconBadge";
import { routeForAppointment } from "@/lib/appointments/status";
import { useAppointment } from "@/viewmodel/useAppointments";

type StepStatus = "done" | "active" | "pending";

const steps: { key: string; label: string; status: StepStatus }[] = [
  { key: "specialty", label: "Matching specialty", status: "done" },
  { key: "availability", label: "Checking availability", status: "active" },
  { key: "appointment", label: "Preparing appointment", status: "pending" },
];

const POLL_TIMEOUT_MS = 30_000;

function OutcomeScreen({
  icon,
  title,
  body,
  primary,
  secondary,
}: {
  icon: IconName;
  title: string;
  body: string;
  primary: { label: string; onPress: () => void };
  secondary?: { label: string; onPress: () => void };
}) {
  return (
    <View className={"bg-white flex-1 items-center justify-center px-8"}>
      <IconBadge name={icon} size={"lg"} />
      <SectionHeading className={"text-mainText mt-6 text-center"}>{title}</SectionHeading>
      <Body className={"text-greyColor mt-2 text-center"}>{body}</Body>
      <Pressable
        onPress={primary.onPress}
        accessibilityRole={"button"}
        className={"bg-primaryColor rounded-full py-4 px-8 mt-8 self-stretch items-center active:opacity-80"}
      >
        <ButtonText className={"text-white"}>{primary.label}</ButtonText>
      </Pressable>
      {secondary && (
        <Pressable
          onPress={secondary.onPress}
          accessibilityRole={"button"}
          className={"py-4 items-center"}
        >
          <ButtonText className={"text-primaryColor"}>{secondary.label}</ButtonText>
        </Pressable>
      )}
    </View>
  );
}

export default function FindingMidwifePage() {
  const router = useRouter();
  const { appointmentId } = useLocalSearchParams<{ appointmentId: string }>();
  const id = Number(appointmentId);
  const [timedOut, setTimedOut] = useState(false);
  const { data: appointment, refetch, isFetching } = useAppointment(id, {
    poll: !timedOut,
  });
  const status = appointment?.status;

  useEffect(() => {
    const timeout = setTimeout(() => setTimedOut(true), POLL_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (appointment && status === "MATCHED") {
      router.replace(routeForAppointment(appointment, new Date()));
    }
  }, [appointment, status, router]);

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

  const outerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: outerScale.value }],
  }));
  const middleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: middleScale.value }],
  }));
  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  const pickAnotherTime = () =>
    router.replace({
      pathname: "/consult/match-preferences",
      params: appointment ? { concern: appointment.concern } : {},
    });

  if (status === "EXPIRED" || status === "CANCELLED") {
    return (
      <OutcomeScreen
        icon={"calendar"}
        title={"No midwife is available for that time"}
        body={"All our midwives are booked for that slot. Pick another time and we'll try again."}
        primary={{ label: "Pick another time", onPress: pickAnotherTime }}
      />
    );
  }

  if (timedOut && status === "PENDING_MATCH") {
    return (
      <OutcomeScreen
        icon={"search"}
        title={"Still looking for your midwife"}
        body={"This is taking longer than usual. We'll keep your request open."}
        primary={{
          label: isFetching ? "Checking..." : "Check again",
          onPress: () => refetch(),
        }}
        secondary={{
          label: "Go to My Consultations",
          onPress: () => router.replace("/consult/consultations"),
        }}
      />
    );
  }

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
          <View className={"w-16 h-16 rounded-full bg-primaryColor items-center justify-center"}>
            <Icon name={"stethoscope"} size={28} color={"#FFFFFF"} />
          </View>
        </Animated.View>
      </Animated.View>

      <SectionHeading className={"text-mainText mt-8"}>
        Finding your midwife...
      </SectionHeading>
      <Body className={"text-greyColor mt-1"}>
        This can take up to a minute
      </Body>

      <View className={"w-full mt-10 gap-4"}>
        {steps.map((step) => (
          <View key={step.key} className={"flex-row items-center gap-3"}>
            {step.status === "done" && (
              <View
                className={
                  "w-6 h-6 rounded-full bg-primaryColor items-center justify-center"
                }
              >
                <Icon name={"check"} size={14} color={"#FFFFFF"} strokeWidth={2.5} />
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
              <View className={"w-6 h-6 rounded-full bg-borderGreyColor"} />
            )}
            <CardTitle
              className={
                step.status === "pending" ? "text-greyColor" : "text-mainText"
              }
            >
              {step.label}
            </CardTitle>
          </View>
        ))}
      </View>
    </View>
  );
}

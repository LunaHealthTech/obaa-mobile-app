import { useCallback } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { RadialBackground } from "@/components/RadialBackground";
import { AppHeader } from "@/components/AppHeader";
import {
  Body,
  ButtonText,
  CardTitle,
  Caption,
  Label,
  PageTitle,
  SectionHeading,
} from "@/components/Typography";
import { Icon, type IconName } from "@/components/icons/Icon";
import { IconBadge } from "@/components/icons/IconBadge";
import { ConsultationRow } from "@/components/ConsultationRow";
import { concernOptions } from "@/lib/appointments/concerns";
import { theme } from "@/constants/theme";
import { useAppointments } from "@/viewmodel/useAppointments";
import type { Appointment } from "@/types/appointment.types";

const HOME_CONSULTATION_LIMIT = 3;

const steps: { title: string; description: string; icon: IconName }[] = [
  {
    title: "Book a consultation",
    description: "Choose how and when you'd like to connect.",
    icon: "calendar-check",
  },
  {
    title: "Speak with a midwife",
    description: "Talk via chat, audio or video with a certified professional.",
    icon: "chat",
  },
  {
    title: "Receive guidance",
    description: "Get personalized advice and follow-up support.",
    icon: "sparkles",
  },
];

const trustBadges: { label: string; icon: IconName }[] = [
  { label: "Verified Professionals", icon: "shield-check" },
  { label: "Private & Secure", icon: "lock" },
  { label: "Flexible Scheduling", icon: "calendar" },
];

function MyConsultations({
  upcoming,
  onViewAll,
  onBook,
  className,
}: {
  upcoming: Appointment[];
  onViewAll: () => void;
  onBook: () => void;
  className: string;
}) {
  return (
    <View className={`px-4 ${className}`}>
      <View className={"flex-row justify-between items-center mb-3"}>
        <SectionHeading className={"text-mainText"}>My Consultations</SectionHeading>
        <Pressable
          onPress={onViewAll}
          accessibilityRole={"button"}
          className={"flex-row items-center gap-1"}
        >
          <Label className={"text-primaryColor"}>View all</Label>
          <Icon name={"arrow-right"} size={14} color={theme.primaryColor} />
        </Pressable>
      </View>
      {upcoming.length > 0 ? (
        <View className={"gap-3"}>
          {upcoming.slice(0, HOME_CONSULTATION_LIMIT).map((appointment) => (
            <ConsultationRow key={appointment.id} appointment={appointment} />
          ))}
        </View>
      ) : (
        <View className={"bg-white border border-borderGreyColor rounded-xl p-6 items-center"}>
          <IconBadge name={"calendar"} size={"lg"} />
          <CardTitle className={"text-mainText mt-3"}>No consultations yet</CardTitle>
          <Body className={"text-greyColor text-center mt-1"}>
            When you schedule a consultation, it&apos;ll appear here
          </Body>
          <Pressable onPress={onBook} accessibilityRole={"button"} className={"mt-3"}>
            <Label className={"text-primaryColor"}>Book your first consultation</Label>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function ConsultPage() {
  const router = useRouter();

  const handleBookConsultation = () => {
    router.push("/consult/booking-method");
  };

  const { data: upcoming, refetch } = useAppointments("upcoming");
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const handleViewAllConsultations = () => {
    router.push("/consult/consultations");
  };

  const hasUpcoming = (upcoming?.length ?? 0) > 0;

  return (
    <ScrollView className={"bg-white flex-1"}>
      <AppHeader />

      <View className={"px-4 mt-2"}>
        <Caption className={"text-primaryColor tracking-widest uppercase"}>
          Obaa + Consult
        </Caption>
        <PageTitle className={"text-mainText mt-1"}>
          Need Help Today?
        </PageTitle>
        <Body className={"text-greyColor mt-2"}>
          Talk to a certified midwife for trusted maternal and reproductive
          healthcare support
        </Body>
      </View>

      {hasUpcoming && (
        <MyConsultations
          upcoming={upcoming ?? []}
          onViewAll={handleViewAllConsultations}
          onBook={handleBookConsultation}
          className={"mt-5"}
        />
      )}

      <View className={"mx-4 mt-5 rounded-2xl overflow-hidden relative"}>
        <RadialBackground colors={["#0FCAD2CC", "#015364"]} />
        <View className={"p-5"}>
          <IconBadge name={"stethoscope"} tone={"inverse"} />
          <SectionHeading className={"text-white mt-4"}>
            Talk To a Certified Midwife
          </SectionHeading>
          <Body className={"text-[#CCDDE0] mt-1"}>
            Get support for pregnancy, menstrual health, symptoms,
            emotional wellbeing and more.
          </Body>
          <Pressable
            onPress={handleBookConsultation}
            accessibilityRole={"button"}
            className={
              "bg-white rounded-full py-4 flex-row items-center justify-center gap-2 mt-5 active:opacity-80"
            }
          >
            <ButtonText className={"text-primaryColor"}>
              Book a Consultation
            </ButtonText>
            <Icon name={"arrow-right"} size={18} color={theme.primaryColor} />
          </Pressable>
        </View>
      </View>

      <View className={"px-4 mt-6"}>
        <SectionHeading className={"text-mainText mb-3"}>
          What We Help With
        </SectionHeading>
        <View className={"flex-row flex-wrap gap-2"}>
          {concernOptions.map((topic) => (
            <Pressable
              key={topic.code}
              onPress={() =>
                router.push({
                  pathname: "/consult/match-preferences",
                  params: { concern: topic.code },
                })
              }
              accessibilityRole={"button"}
              accessibilityHint={"Starts a booking for this topic"}
              className={"bg-[#0F969C1A] rounded-full px-4 py-2 active:opacity-70"}
            >
              <Label className={"text-primaryColor"}>{topic.label}</Label>
            </Pressable>
          ))}
        </View>
      </View>

      <View className={"px-4 mt-6"}>
        <SectionHeading className={"text-mainText mb-3"}>
          How it works
        </SectionHeading>
        <View className={"bg-white border border-borderGreyColor rounded-xl p-4"}>
          {steps.map((step, index) => (
            <View key={step.title} className={"flex-row gap-3"}>
              <View className={"items-center"}>
                <IconBadge name={step.icon} size={"sm"} />
                {index < steps.length - 1 && (
                  <View className={"w-px flex-1 bg-borderGreyColor my-1"} />
                )}
              </View>
              <View className={`flex-1 ${index < steps.length - 1 ? "pb-4" : ""}`}>
                <Caption className={"text-primaryColor"}>Step {index + 1}</Caption>
                <CardTitle className={"text-mainText"}>{step.title}</CardTitle>
                <Body className={"text-greyColor mt-0.5"}>{step.description}</Body>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={"px-4 mt-6 flex-row gap-3"}>
        {trustBadges.map((badge) => (
          <View
            key={badge.label}
            className={"flex-1 items-center bg-white border border-borderGreyColor rounded-xl py-4 px-2"}
          >
            <IconBadge name={badge.icon} />
            <Caption className={"text-mainText text-center mt-2"}>{badge.label}</Caption>
          </View>
        ))}
      </View>

      {!hasUpcoming && (
        <MyConsultations
          upcoming={[]}
          onViewAll={handleViewAllConsultations}
          onBook={handleBookConsultation}
          className={"mt-8"}
        />
      )}

      <View className={"h-10"} />
    </ScrollView>
  );
}

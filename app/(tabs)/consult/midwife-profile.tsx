import { useEffect } from "react";
import { View, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Body,
  ButtonText,
  Caption,
  CardTitle,
  Label,
  PageTitle,
  SectionHeading,
} from "@/components/Typography";
import { MidwifeAvatar } from "@/components/MidwifeAvatar";
import { VerifiedMark, consultationTypeIcon } from "@/components/AppointmentSummary";
import { MidwifeUnavailable } from "@/components/MidwifeUnavailable";
import { ScreenHeader } from "@/components/ScreenHeader";
import { IconBadge } from "@/components/icons/IconBadge";
import type { IconName } from "@/components/icons/Icon";
import { forgetMidwives, isMidwifeGone, useMidwife } from "@/viewmodel/useAppointments";

function Stat({ icon, value, label }: { icon: IconName; value: string; label: string }) {
  return (
    <View className={"flex-1 items-center bg-white border border-borderGreyColor rounded-xl py-3"}>
      <IconBadge name={icon} size={"sm"} />
      <CardTitle className={"text-mainText mt-2"}>{value}</CardTitle>
      <Caption className={"text-greyColor mt-0.5"}>{label}</Caption>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className={"px-4 mt-6"}>
      <SectionHeading className={"text-mainText mb-3"}>{title}</SectionHeading>
      {children}
    </View>
  );
}

export default function MidwifeProfilePage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: midwife, error, refetch } = useMidwife(Number(id));
  const midwifeGone = isMidwifeGone(error);

  useEffect(() => {
    if (midwifeGone) forgetMidwives();
  }, [midwifeGone]);

  const stats: { icon: IconName; value: string; label: string }[] = midwife
    ? [
        { icon: "award", value: `${midwife.years_of_experience} yrs`, label: "Experience" },
        { icon: "calendar-check", value: `${midwife.consultations_count}`, label: "Consultations" },
        ...(midwife.satisfaction_rate !== null
          ? [{ icon: "sparkles" as const, value: `${midwife.satisfaction_rate}%`, label: "Satisfaction" }]
          : []),
      ]
    : [];

  const handleBookAppointment = () => {
    router.push({
      pathname: "/consult/book-midwife",
      params: { midwifeId: id },
    });
  };

  return (
    <View className={"bg-white flex-1"}>
      <ScreenHeader title={"Midwife Profile"} bordered={true} />

      {midwifeGone ? (
        <MidwifeUnavailable
          actionLabel={"Choose another midwife"}
          onAction={() => router.replace("/consult/choose-midwife")}
        />
      ) : !midwife ? (
        <View className={"flex-1 items-center justify-center"}>
          {error ? (
            <Pressable onPress={() => refetch()} accessibilityRole={"button"}>
              <Body className={"text-greyColor"}>
                Couldn&apos;t load this profile.{" "}
                <Label className={"text-primaryColor"}>Try again</Label>
              </Body>
            </Pressable>
          ) : (
            <ActivityIndicator color={"#0F969C"} />
          )}
        </View>
      ) : (
        <>
          <ScrollView className={"flex-1"}>
            <View className={"flex-row items-center gap-4 px-4 pt-5"}>
              <MidwifeAvatar midwife={midwife} size={72} shape={"rounded"} />
              <View className={"flex-1"}>
                <View className={"flex-row items-center gap-1.5"}>
                  <PageTitle className={"text-mainText flex-shrink"}>
                    {midwife.display_name}
                  </PageTitle>
                  <VerifiedMark verified={midwife.verified} size={20} />
                </View>
                <Body className={"text-greyColor mt-0.5"}>{midwife.credential}</Body>
              </View>
            </View>

            <View className={"flex-row gap-3 px-4 mt-5"}>
              {stats.map((stat) => (
                <Stat key={stat.label} icon={stat.icon} value={stat.value} label={stat.label} />
              ))}
            </View>

            {!!midwife.bio && (
              <Section title={"About"}>
                <Body className={"text-greyColor leading-5"}>{midwife.bio}</Body>
              </Section>
            )}

            <Section title={"Area of Expertise"}>
              <View className={"flex-row flex-wrap gap-2"}>
                {midwife.specialties.map((item) => (
                  <View key={item.code} className={"bg-[#0F969C1A] rounded-full px-4 py-2"}>
                    <Label className={"text-primaryColor"}>{item.label}</Label>
                  </View>
                ))}
              </View>
            </Section>

            {midwife.languages.length > 0 && (
              <Section title={"Languages"}>
                <View className={"flex-row flex-wrap gap-2"}>
                  {midwife.languages.map((language) => (
                    <View
                      key={language}
                      className={"border border-borderGreyColor rounded-full px-4 py-2"}
                    >
                      <Label className={"text-mainText"}>{language}</Label>
                    </View>
                  ))}
                </View>
              </Section>
            )}

            {(!!midwife.education || !!midwife.credential) && (
              <Section title={"Education & Certification"}>
                <View className={"gap-3"}>
                  {[midwife.education, midwife.credential].filter(Boolean).map((line) => (
                    <View key={line} className={"flex-row items-center gap-3"}>
                      <IconBadge name={"award"} size={"sm"} tone={"neutral"} />
                      <Body className={"text-mainText flex-1"}>{line}</Body>
                    </View>
                  ))}
                </View>
              </Section>
            )}

            <Section title={"Available Consultation Types"}>
              <View className={"gap-3"}>
                {midwife.consultation_types.map((type) => (
                  <View
                    key={type.type}
                    className={
                      "flex-row items-center gap-3 bg-white border border-borderGreyColor rounded-xl px-4 py-3"
                    }
                  >
                    <IconBadge name={consultationTypeIcon[type.type]} size={"sm"} />
                    <Label className={"text-mainText flex-1"}>{type.label}</Label>
                    <Caption className={"text-greyColor"}>{type.duration_minutes} min</Caption>
                  </View>
                ))}
              </View>
            </Section>

            <View className={"h-6"} />
          </ScrollView>

          <View className={"px-4 py-4 border-t border-borderGreyColor"}>
            <Pressable
              onPress={handleBookAppointment}
              accessibilityRole={"button"}
              className={
                "bg-primaryColor rounded-full py-4 items-center justify-center active:opacity-80"
              }
            >
              <ButtonText className={"text-white"}>Book Appointment</ButtonText>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

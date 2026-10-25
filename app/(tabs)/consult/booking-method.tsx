import { View, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import {
  Body,
  ButtonText,
  Caption,
  SectionHeading,
} from "@/components/Typography";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Icon } from "@/components/icons/Icon";
import { IconBadge } from "@/components/icons/IconBadge";
import { theme } from "@/constants/theme";

const matchBenefits = ["Faster booking", "Less searching", "Best available match"];

export default function BookingMethodPage() {
  const router = useRouter();

  const handleMatchMe = () => {
    router.push("/consult/match-preferences");
  };

  const handleChooseMidwife = () => {
    router.push("/consult/choose-midwife");
  };

  return (
    <ScrollView className={"bg-white flex-1"}>
      <ScreenHeader
        title={"How would you like to book?"}
        subtitle={"Choose how you'd prefer to connect with your midwife"}
      />

      <View className={"mx-4 mt-2 rounded-2xl border-2 border-primaryColor p-4"}>
        <View className={"flex-row items-start justify-between"}>
          <IconBadge name={"sparkles"} shape={"rounded"} />
          <View className={"bg-primaryColor rounded-full px-3 py-1"}>
            <Caption className={"text-white"}>Recommended</Caption>
          </View>
        </View>
        <SectionHeading className={"text-mainText mt-3"}>
          Let Obaa+ Match You
        </SectionHeading>
        <Body className={"text-greyColor mt-1"}>
          Tell us your preferred date, time and consultation type and
          we&apos;ll match you with the best available certified midwife.
        </Body>
        <View className={"mt-3 gap-2"}>
          {matchBenefits.map((benefit) => (
            <View key={benefit} className={"flex-row items-center gap-2"}>
              <Icon name={"check-circle"} size={18} color={theme.primaryColor} />
              <Body className={"text-mainText"}>{benefit}</Body>
            </View>
          ))}
        </View>
        <Pressable
          onPress={handleMatchMe}
          accessibilityRole={"button"}
          className={
            "bg-primaryColor rounded-full py-4 flex-row items-center justify-center gap-2 mt-4 active:opacity-80"
          }
        >
          <ButtonText className={"text-white"}>Continue</ButtonText>
          <Icon name={"arrow-right"} size={18} color={"#FFFFFF"} />
        </Pressable>
      </View>

      <View className={"mx-4 mt-4 rounded-2xl border border-borderGreyColor p-4"}>
        <IconBadge name={"user"} tone={"neutral"} shape={"rounded"} />
        <SectionHeading className={"text-mainText mt-3"}>
          Choose a Midwife Yourself
        </SectionHeading>
        <Body className={"text-greyColor mt-1"}>
          Browse certified midwives and choose who you&apos;d like to consult
          with directly
        </Body>
        <Pressable
          onPress={handleChooseMidwife}
          accessibilityRole={"button"}
          className={
            "bg-white border-2 border-primaryColor rounded-full py-4 flex-row items-center justify-center gap-2 mt-4 active:opacity-80"
          }
        >
          <ButtonText className={"text-primaryColor"}>Browse midwives</ButtonText>
          <Icon name={"arrow-right"} size={18} color={theme.primaryColor} />
        </Pressable>
      </View>

      <View className={"h-10"} />
    </ScrollView>
  );
}

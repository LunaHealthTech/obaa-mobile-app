import { View, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  Body,
  ButtonText,
  Caption,
  PageTitle,
  SectionHeading,
} from "@/components/Typography";

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
      <View className={"flex-row items-start gap-3 px-4 pt-4"}>
        <Pressable
          onPress={() => router.back()}
          className={
            "w-10 h-10 rounded-full border border-borderGreyColor items-center justify-center"
          }
        >
          <Ionicons name={"chevron-back"} size={20} color={"#17252A"} />
        </Pressable>
        <View className={"flex-1 mt-1"}>
          <PageTitle className={"text-mainText"}>
            How would you like to book?
          </PageTitle>
          <Body className={"text-greyColor mt-1"}>
            Choose how you&apos;d prefer to connect with your midwife
          </Body>
        </View>
      </View>

      <View
        className={
          "mx-4 mt-6 rounded-2xl border-2 border-primaryColor p-4"
        }
      >
        <View className={"flex-row items-start justify-between"}>
          <View
            className={
              "bg-[#0F969C1A] rounded-xl w-12 h-12 items-center justify-center"
            }
          >
            <FontAwesome name={"random"} size={20} color={"#0F969C"} />
          </View>
          <View className={"bg-primaryColor rounded-full px-3 py-1"}>
            <Caption className={"text-white"}>
              Recommended
            </Caption>
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
              <FontAwesome name={"check-circle"} size={16} color={"#0F969C"} />
              <Body className={"text-mainText"}>{benefit}</Body>
            </View>
          ))}
        </View>
        <Pressable
          onPress={handleMatchMe}
          className={
            "bg-primaryColor rounded-full py-4 items-center justify-center mt-4 active:opacity-80"
          }
        >
          <ButtonText className={"text-white"}>Continue</ButtonText>
        </Pressable>
      </View>

      <View
        className={
          "mx-4 mt-4 rounded-2xl border border-borderGreyColor p-4"
        }
      >
        <View
          className={
            "bg-[#F5F7F8] rounded-xl w-12 h-12 items-center justify-center"
          }
        >
          <FontAwesome name={"id-card-o"} size={20} color={"#455A64"} />
        </View>
        <SectionHeading className={"text-mainText mt-3"}>
          Choose a Midwife Yourself
        </SectionHeading>
        <Body className={"text-greyColor mt-1"}>
          Browse certified midwives and choose who you&apos;d like to consult
          with directly
        </Body>
        <Pressable
          onPress={handleChooseMidwife}
          className={
            "bg-white border-2 border-primaryColor rounded-full py-4 items-center justify-center mt-4 active:opacity-80"
          }
        >
          <ButtonText className={"text-primaryColor"}>Continue</ButtonText>
        </Pressable>
      </View>

      <View className={"h-10"} />
    </ScrollView>
  );
}

import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Rafiki from "@/assets/rafiki.svg";
import { Body, ButtonText, PageTitle } from "@/components/Typography";

export default function Persona() {
  const router = useRouter();
  return (
    <View className={"flex-1 items-center justify-between my-10"}>
      <View className={"items-center my-10"}>
        <PageTitle className={"flex items-center "}>
          Track Your Cycle with Confidence!
        </PageTitle>
        <Body className={"flex text-center"}>
          Stay on top of your period, symptoms, and mood with personalized
          insights tailored to your unique cycle.
        </Body>
      </View>
      <Rafiki />

      <Pressable
        onPress={() => {
          router.navigate("/onboarding/menstrual-profile-setup");
        }}
        className={
          "bg-primaryColor text-white w-[360px] h-[62px] rounded-full flex items-center justify-center active:opacity-80"
        }
      >
        <ButtonText className={"text-white"}>Continue</ButtonText>
      </Pressable>
    </View>
  );
}

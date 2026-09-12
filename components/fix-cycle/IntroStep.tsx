import { View, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFixCycleStore } from "@/repositories/useFixCycleStore";
import { Body, ButtonText, SectionHeading } from "@/components/Typography";

export function IntroStep() {
  const setStep = useFixCycleStore((s) => s.setStep);
  const dismiss = useFixCycleStore((s) => s.dismiss);

  return (
    <View className="bg-white items-center px-8 py-8">
      <View className="w-20 h-20 rounded-full bg-[#0F969C1A] items-center justify-center mb-6">
        <Ionicons name="calendar" size={32} color="#0F969C" />
      </View>
      <SectionHeading className="text-mainText text-center">
        ✨ Let's fix your cycle
      </SectionHeading>
      <Body className="text-subText text-center mt-2 mb-8">
        Just update what you remember — we'll handle the rest.
      </Body>
      <Pressable
        onPress={() => setStep("period-start")}
        className="bg-primaryColor rounded-full w-full py-4 items-center mb-3"
      >
        <ButtonText className="text-white">Start Editing</ButtonText>
      </Pressable>
      <Pressable
        onPress={dismiss}
        className="border-2 border-borderGreyColor rounded-full w-full py-4 items-center"
      >
        <ButtonText className="text-mainText">Cancel</ButtonText>
      </Pressable>
    </View>
  );
}

import { View, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { usePeriodCheckInStore } from "@/repositories/usePeriodCheckInStore";
import { useSaveCycleDate } from "@/viewmodel/usePeriodCheckIn";
import { Body, ButtonText, SectionHeading } from "@/components/Typography";

export function QuickCheckInStep() {
  const { date, setStep } = usePeriodCheckInStore();
  const { save: saveCycleDate, isSaving } = useSaveCycleDate();

  const onYes = () => {
    saveCycleDate(date, {
      onSuccess: () => setStep("flow-intensity"),
    });
  };

  return (
    <View className="bg-white items-center px-8 py-8">
      <View className="w-20 h-20 rounded-full bg-[#0F969C1A] items-center justify-center mb-6">
        <Ionicons name="calendar" size={32} color="#0F969C" />
      </View>
      <SectionHeading className="text-mainText text-center">
        🌸 Quick Check-In
      </SectionHeading>
      <Body className="text-subText text-center mt-2 mb-8">
        We just want to make sure your tracking stays accurate 💕
      </Body>
      <SectionHeading className="text-mainText text-center mb-6">
        Have you started your period or noticed any bleeding today?
      </SectionHeading>
      <Pressable
        onPress={onYes}
        disabled={isSaving}
        className="border-2 border-primaryColor rounded-full w-full py-4 items-center mb-3"
      >
        <ButtonText className="text-primaryColor">
          {isSaving ? "Saving..." : "🩸 Yes, I'm seeing blood"}
        </ButtonText>
      </Pressable>
      <Pressable
        onPress={() => setStep("not-yet")}
        disabled={isSaving}
        className="border-2 border-borderGreyColor rounded-full w-full py-4 items-center"
      >
        <ButtonText className="text-mainText">🌿 No, Not yet</ButtonText>
      </Pressable>
    </View>
  );
}

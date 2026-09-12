import { View, Pressable } from "react-native";
import { useFixCycleStore } from "@/repositories/useFixCycleStore";
import { Body, ButtonText, Caption, SectionHeading } from "@/components/Typography";

export function SuccessStep() {
  const reset = useFixCycleStore((s) => s.reset);

  return (
    <View className="bg-white items-center px-8 py-8">
      <SectionHeading className="text-mainText text-center mb-2">
        🎉 All Set
      </SectionHeading>
      <View className="bg-[#0F969C1A] rounded-full px-3 py-1 mb-4">
        <Caption className="text-primaryColor">Update Complete 🔥</Caption>
      </View>
      <Body className="text-subText text-center mb-8">
        Your cycle has been updated. We'll use this to give you better
        insights going forward.
      </Body>
      <Pressable
        onPress={reset}
        className="bg-primaryColor rounded-full w-full py-4 items-center"
      >
        <ButtonText className="text-white">Done</ButtonText>
      </Pressable>
    </View>
  );
}

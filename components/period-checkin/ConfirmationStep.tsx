import { View, Pressable } from "react-native";
import { usePeriodCheckInStore } from "@/repositories/usePeriodCheckInStore";
import { Body, ButtonText, SectionHeading } from "@/components/Typography";

export function ConfirmationStep() {
  const close = usePeriodCheckInStore((s) => s.close);

  return (
    <View className="bg-white items-center px-8 py-8">
      <SectionHeading className="text-mainText text-center mb-2">
        💞 All Set for Today
      </SectionHeading>
      <Body className="text-subText text-center mb-8">
        Thank you for checking in. Your period details have been saved, and
        we'll take it from here 🤟
      </Body>
      <Pressable
        onPress={close}
        className="bg-primaryColor rounded-full w-full py-4 items-center"
      >
        <ButtonText className="text-white">Done</ButtonText>
      </Pressable>
    </View>
  );
}

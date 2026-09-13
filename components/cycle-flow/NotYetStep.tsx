import { View, Pressable } from "react-native";
import { useCycleFlowStore } from "@/repositories/useCycleFlowStore";
import { Body, ButtonText, SectionHeading } from "@/components/Typography";

export function NotYetStep() {
  const close = useCycleFlowStore((s) => s.close);

  return (
    <View className="bg-white items-center px-8 py-8">
      <SectionHeading className="text-mainText text-center mb-2">
        🤍 That's perfectly okay
      </SectionHeading>
      <Body className="text-subText text-center mb-8">
        Bodies aren't always predictable. We'll keep an eye on things and let
        you know when it's time. You can check in anytime if something
        changes.
      </Body>
      <Pressable
        onPress={close}
        className="bg-primaryColor rounded-full w-full py-4 items-center"
      >
        <ButtonText className="text-white">Continue</ButtonText>
      </Pressable>
    </View>
  );
}

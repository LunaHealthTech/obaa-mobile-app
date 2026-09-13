import { View, Pressable } from "react-native";
import { useCycleFlowStore } from "@/repositories/useCycleFlowStore";
import { Body, ButtonText, Caption, Label, SectionHeading } from "@/components/Typography";

const INTENSITIES = ["Light", "Medium", "Heavy", "Spotting"];

export function FlowIntensityStep() {
  const flowIntensity = useCycleFlowStore((s) =>
    s.state.mode === "current-cycle" ? s.state.flowIntensity : null,
  );
  const setFlowIntensity = useCycleFlowStore((s) => s.setFlowIntensity);
  const advance = useCycleFlowStore((s) => s.advance);

  return (
    <View className="bg-white px-6 pt-8 pb-8">
      <Caption className="text-subText text-center">Step 2 of 3</Caption>
      <SectionHeading className="text-mainText text-center mt-1 mb-1">
        🩸 Flow Intensity
      </SectionHeading>
      <Body className="text-subText text-center mb-6">
        How would you describe your flow today? There's no right answer,
        every body is different.
      </Body>
      {INTENSITIES.map((intensity) => {
        const isSelected = flowIntensity === intensity;
        return (
          <Pressable
            key={intensity}
            onPress={() => setFlowIntensity(intensity)}
            className={`rounded-full py-4 items-center mb-3 border-2 ${
              isSelected ? "border-primaryColor" : "border-borderGreyColor"
            }`}
          >
            <Label
              className={isSelected ? "text-primaryColor" : "text-mainText"}
            >
              {intensity}
            </Label>
          </Pressable>
        );
      })}
      <Pressable
        onPress={() => advance("symptoms")}
        className="bg-primaryColor rounded-full py-4 items-center mt-4"
      >
        <ButtonText className="text-white">Continue</ButtonText>
      </Pressable>
    </View>
  );
}

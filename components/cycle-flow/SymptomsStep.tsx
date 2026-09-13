import { View, Pressable } from "react-native";
import { toast } from "sonner-native";
import { useCycleFlowStore } from "@/repositories/useCycleFlowStore";
import { usePeriodCheckIn } from "@/viewmodel/usePeriodCheckIn";
import { MOOD_OPTIONS } from "@/constants/logOptions";
import { Body, ButtonText, Caption, Label, SectionHeading } from "@/components/Typography";

const SYMPTOMS = [
  "Cramps",
  "Lower back pain",
  "Fatigue",
  "Headache",
  "Bloating",
  "Breast tenderness",
  "Mood swings",
  "Nausea",
  "None / I feel okay",
];

export function SymptomsStep() {
  const moods = useCycleFlowStore((s) =>
    s.state.mode === "current-cycle" ? s.state.moods : [],
  );
  const symptoms = useCycleFlowStore((s) =>
    s.state.mode === "current-cycle" ? s.state.symptoms : [],
  );
  const toggleMood = useCycleFlowStore((s) => s.toggleMood);
  const toggleSymptom = useCycleFlowStore((s) => s.toggleSymptom);
  const advance = useCycleFlowStore((s) => s.advance);
  const { save, isSaving } = usePeriodCheckIn();

  const onSave = () => {
    save(undefined, {
      onSuccess: () => advance("confirmation"),
      onError: () => toast.error("Something went wrong saving your check-in"),
    });
  };

  return (
    <View className="bg-white px-6 pt-8 pb-8">
      <Caption className="text-subText text-center">Step 3 of 3</Caption>
      <SectionHeading className="text-mainText text-center mt-1 mb-1">
        🩸 Mood & Symptoms
      </SectionHeading>
      <Body className="text-subText text-center mb-6">
        How is your body feeling?
      </Body>
      <Label className="text-mainText mb-2">Mood</Label>
      <View className="flex-row flex-wrap gap-2 justify-center mb-6">
        {MOOD_OPTIONS.map(({ emoji, label }) => {
          const isSelected = moods.includes(label);
          return (
            <Pressable
              key={label}
              onPress={() => toggleMood(label)}
              className={`rounded-full px-4 py-2 border ${
                isSelected
                  ? "bg-primaryColor border-primaryColor"
                  : "border-borderGreyColor"
              }`}
            >
              <Label className={isSelected ? "text-white" : "text-mainText"}>
                {emoji} {label}
              </Label>
            </Pressable>
          );
        })}
      </View>
      <Label className="text-mainText mb-2">Symptoms</Label>
      <View className="flex-row flex-wrap gap-2 justify-center">
        {SYMPTOMS.map((symptom) => {
          const isSelected = symptoms.includes(symptom);
          return (
            <Pressable
              key={symptom}
              onPress={() => toggleSymptom(symptom)}
              className={`rounded-full px-4 py-2 border ${
                isSelected
                  ? "bg-primaryColor border-primaryColor"
                  : "border-borderGreyColor"
              }`}
            >
              <Label className={isSelected ? "text-white" : "text-mainText"}>
                {symptom}
              </Label>
            </Pressable>
          );
        })}
      </View>
      {moods.length === 0 && (
        <Caption className="text-subText text-center mt-4">
          Select at least one mood to save your log
        </Caption>
      )}
      <Pressable
        onPress={onSave}
        disabled={isSaving || moods.length === 0}
        className={`rounded-full py-4 items-center mt-2 ${
          isSaving || moods.length === 0
            ? "bg-borderGreyColor"
            : "bg-primaryColor"
        }`}
      >
        <ButtonText className="text-white">
          {isSaving ? "Saving..." : "Save Today's Log"}
        </ButtonText>
      </Pressable>
    </View>
  );
}

import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { toast } from "sonner-native";
import { usePeriodCheckInStore } from "@/repositories/usePeriodCheckInStore";
import { usePeriodCheckIn } from "@/viewmodel/usePeriodCheckIn";

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

export default function PeriodSymptoms() {
  const router = useRouter();
  const { symptoms, toggleSymptom } = usePeriodCheckInStore();
  const { save, isSaving } = usePeriodCheckIn();

  const onSave = () => {
    save(undefined, {
      onSuccess: () => router.push("/period-checkin/confirmation"),
      onError: () => toast.error("Something went wrong saving your check-in"),
    });
  };

  return (
    <View className="bg-white px-6 pt-8 pb-8">
      <Text className="text-subText text-center">Step 3 of 3</Text>
      <Text className="text-xl font-semibold text-mainText text-center mt-1 mb-1">
        🩸 Period-Related Symptoms
      </Text>
      <Text className="text-subText text-center mb-6">
        How is your body feeling?
      </Text>
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
              <Text className={isSelected ? "text-white" : "text-mainText"}>
                {symptom}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        onPress={onSave}
        disabled={isSaving}
        className="bg-primaryColor rounded-full py-4 items-center mt-6"
      >
        <Text className="text-white font-semibold">
          {isSaving ? "Saving..." : "Save Today's Log"}
        </Text>
      </Pressable>
    </View>
  );
}

import { useEffect, useState } from "react";
import { View, ScrollView, Pressable, TextInput } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { format } from "date-fns";
import { AppHeader } from "@/components/AppHeader";
import { Calendar } from "@/components/Calendar";
import { useDayLog } from "@/viewmodel/useDayLog";
import type { CreateLogPayload } from "@/types/menstrual.types";
import { MOOD_OPTIONS, SYMPTOM_OPTIONS } from "@/constants/logOptions";
import { Body, ButtonText, Label, SectionHeading } from "@/components/Typography";

function ChipRow({
  options,
  selected,
  onToggle,
}: {
  options: { emoji: string; label: string }[];
  selected: string[];
  onToggle: (label: string) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map(({ emoji, label }) => {
        const isSelected = selected.includes(label);
        return (
          <Pressable
            key={label}
            onPress={() => onToggle(label)}
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
  );
}

export default function Logs() {
  const { date: dateParam } = useLocalSearchParams<{ date?: string }>();
  const [selectedDate, setSelectedDate] = useState(
    dateParam ?? format(new Date(), "yyyy-MM-dd"),
  );
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [otherText, setOtherText] = useState("");

  const { log, saveLog, isSavingLog } = useDayLog(selectedDate);

  useEffect(() => {
    setSelectedMoods(log?.mood ? log.mood.split(", ").filter(Boolean) : []);
    setSelectedSymptoms(log?.symptoms ?? []);
    setOtherText("");
  }, [log, selectedDate]);

  const toggleMood = (label: string) => {
    setSelectedMoods((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label],
    );
  };

  const toggleSymptom = (label: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label],
    );
  };

  const handleApply = () => {
    const payload: CreateLogPayload = {
      date: selectedDate,
      mood: selectedMoods.join(", "),
      symptoms: otherText.trim()
        ? [...selectedSymptoms, otherText.trim()]
        : selectedSymptoms,
    };
    saveLog(payload);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="bg-white">
        <AppHeader />
        <View className="bg-white flex-1 w-full">
          <Calendar onDayPress={(date) => setSelectedDate(date)} />
        </View>

        <View className="px-4">
          <Body className="text-subText mb-4">
            Logging for {format(new Date(selectedDate), "d MMM yyyy")}
          </Body>

          <SectionHeading className="text-mainText mb-3">
            Mood
          </SectionHeading>
          <ChipRow options={MOOD_OPTIONS} selected={selectedMoods} onToggle={toggleMood} />

          <SectionHeading className="text-mainText mt-6 mb-3">
            Symptoms
          </SectionHeading>
          <ChipRow
            options={SYMPTOM_OPTIONS}
            selected={selectedSymptoms}
            onToggle={toggleSymptom}
          />

          <SectionHeading className="text-mainText mt-6 mb-3">
            Other
          </SectionHeading>
          <TextInput
            value={otherText}
            onChangeText={setOtherText}
            placeholder="Enter other symptoms you're experiencing"
            placeholderTextColor="#9A9A9A"
            className="border border-borderGreyColor rounded-lg px-4 py-3 text-mainText"
          />

          <Pressable
            onPress={handleApply}
            disabled={isSavingLog}
            className="bg-primaryColor rounded-full py-4 items-center mt-6 mb-8"
          >
            <ButtonText className="text-white">
              {isSavingLog ? "Saving..." : "Apply"}
            </ButtonText>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

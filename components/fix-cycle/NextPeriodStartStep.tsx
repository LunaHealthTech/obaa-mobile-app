import { View, Pressable } from "react-native";
import { useState } from "react";
import { Calendar } from "react-native-calendars";
import { format } from "date-fns";
import { useFixCycleStore } from "@/repositories/useFixCycleStore";
import { Body, ButtonText, Caption, SectionHeading } from "@/components/Typography";

export function NextPeriodStartStep() {
  const { bleedingEnd, nextPeriodStart, setNextPeriodStart, setStep } =
    useFixCycleStore();
  const [selected, setSelected] = useState(nextPeriodStart || bleedingEnd);

  const onNext = () => {
    setNextPeriodStart(selected);
    setStep("summary");
  };

  return (
    <View className="bg-white px-6 pt-8 pb-8">
      <Caption className="text-subText text-center">Step 3 of 3</Caption>
      <SectionHeading className="text-mainText text-center mt-1 mb-1">
        🔄 When did your next period start?
      </SectionHeading>
      <Body className="text-subText text-center mb-4">
        We use this to know when this cycle ended.
      </Body>
      <Calendar
        current={selected}
        minDate={bleedingEnd}
        maxDate={format(new Date(), "yyyy-MM-dd")}
        onDayPress={(day) => setSelected(day.dateString)}
        markedDates={{
          [selected]: { selected: true, selectedColor: "#0F969C" },
        }}
      />
      <Pressable
        onPress={onNext}
        className="bg-primaryColor rounded-full py-4 items-center mt-6 mb-3"
      >
        <ButtonText className="text-white">Next</ButtonText>
      </Pressable>
      <Pressable
        onPress={() => setStep("bleeding-end")}
        className="border-2 border-borderGreyColor rounded-full py-4 items-center"
      >
        <ButtonText className="text-mainText">Back</ButtonText>
      </Pressable>
    </View>
  );
}

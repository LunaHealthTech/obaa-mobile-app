import { View, Pressable } from "react-native";
import { useMemo, useState } from "react";
import { Calendar } from "react-native-calendars";
import { eachDayOfInterval, format } from "date-fns";
import { useFixCycleStore } from "@/repositories/useFixCycleStore";
import { Body, ButtonText, Caption, SectionHeading } from "@/components/Typography";

export function BleedingEndStep() {
  const { periodStart, bleedingEnd, setBleedingEnd, setStep } =
    useFixCycleStore();
  const [selected, setSelected] = useState(bleedingEnd || periodStart);

  const markedDates = useMemo(() => {
    const days = eachDayOfInterval({
      start: new Date(periodStart),
      end: new Date(selected) < new Date(periodStart)
        ? new Date(periodStart)
        : new Date(selected),
    });
    const marks: Record<string, any> = {};
    days.forEach((day, index) => {
      const dateString = format(day, "yyyy-MM-dd");
      marks[dateString] = {
        color: "#E82A73",
        textColor: "white",
        startingDay: index === 0,
        endingDay: index === days.length - 1,
      };
    });
    return marks;
  }, [periodStart, selected]);

  const onNext = () => {
    setBleedingEnd(selected);
    setStep("next-period-start");
  };

  return (
    <View className="bg-white px-6 pt-8 pb-8">
      <Caption className="text-subText text-center">Step 2 of 3</Caption>
      <SectionHeading className="text-mainText text-center mt-1 mb-1">
        🩸 When did the bleeding end?
      </SectionHeading>
      <Body className="text-subText text-center mb-4">
        This is the last day you noticed bleeding
      </Body>
      <Calendar
        current={selected}
        minDate={periodStart}
        maxDate={format(new Date(), "yyyy-MM-dd")}
        onDayPress={(day) => setSelected(day.dateString)}
        markingType="period"
        markedDates={markedDates}
      />
      <Pressable
        onPress={onNext}
        className="bg-primaryColor rounded-full py-4 items-center mt-6 mb-3"
      >
        <ButtonText className="text-white">Next</ButtonText>
      </Pressable>
      <Pressable
        onPress={() => setStep("period-start")}
        className="border-2 border-borderGreyColor rounded-full py-4 items-center"
      >
        <ButtonText className="text-mainText">Back</ButtonText>
      </Pressable>
    </View>
  );
}

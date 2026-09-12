import { View, Pressable } from "react-native";
import { useState } from "react";
import { Calendar } from "react-native-calendars";
import { format } from "date-fns";
import { usePeriodCheckInStore } from "@/repositories/usePeriodCheckInStore";
import { useSaveCycleEndDate } from "@/viewmodel/usePeriodCheckIn";
import { Body, ButtonText, SectionHeading } from "@/components/Typography";

export function EndDateStep() {
  const { date, close } = usePeriodCheckInStore();
  const { save: saveEndDate, isSaving } = useSaveCycleEndDate();
  const [selected, setSelected] = useState(
    date || format(new Date(), "yyyy-MM-dd"),
  );

  const onConfirm = () => {
    saveEndDate(selected, {
      onSuccess: () => close(),
    });
  };

  return (
    <View className="bg-white px-6 pt-8 pb-8">
      <SectionHeading className="text-mainText text-center mt-1 mb-1">
        🩸 When did your period end?
      </SectionHeading>
      <Body className="text-subText text-center mb-4">
        Select the last day you noticed bleeding.
      </Body>
      <Calendar
        current={selected}
        minDate={date}
        maxDate={format(new Date(), "yyyy-MM-dd")}
        onDayPress={(day) => setSelected(day.dateString)}
        markedDates={{
          [selected]: { selected: true, selectedColor: "#0F969C" },
        }}
      />
      <Pressable
        onPress={onConfirm}
        disabled={isSaving}
        className={`rounded-full py-4 items-center mt-6 ${
          isSaving ? "bg-borderGreyColor" : "bg-primaryColor"
        }`}
      >
        <ButtonText className="text-white">
          {isSaving ? "Saving..." : "Confirm End Date"}
        </ButtonText>
      </Pressable>
    </View>
  );
}

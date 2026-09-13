import { View, Pressable } from "react-native";
import { useState } from "react";
import { Calendar } from "react-native-calendars";
import { format } from "date-fns";
import { useCycleFlowStore } from "@/repositories/useCycleFlowStore";
import { Body, ButtonText, Caption, SectionHeading } from "@/components/Typography";

export function PeriodStartStep() {
  const periodStart = useCycleFlowStore((s) =>
    s.state.mode === "old-cycle-correction" ? s.state.periodStart : "",
  );
  const variant = useCycleFlowStore((s) =>
    s.state.mode === "old-cycle-correction" ? s.state.variant : "closed-cycle",
  );
  const setPeriodStart = useCycleFlowStore((s) => s.setPeriodStart);
  const advance = useCycleFlowStore((s) => s.advance);
  const back = useCycleFlowStore((s) => s.back);
  const close = useCycleFlowStore((s) => s.close);
  const [selected, setSelected] = useState(
    periodStart || format(new Date(), "yyyy-MM-dd"),
  );

  const onNext = () => {
    setPeriodStart(selected);
    advance("bleeding-end");
  };

  return (
    <View className="bg-white px-6 pt-8 pb-8">
      <Caption className="text-subText text-center">Step 1 of 3</Caption>
      <SectionHeading className="text-mainText text-center mt-1 mb-1">
        🩸 When did your period start?
      </SectionHeading>
      <Body className="text-subText text-center mb-4">
        This is the first day you noticed bleeding
      </Body>
      <Calendar
        current={selected}
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
        onPress={variant === "stale-current" ? back : close}
        className="border-2 border-borderGreyColor rounded-full py-4 items-center"
      >
        <ButtonText className="text-mainText">
          {variant === "stale-current" ? "Back" : "Cancel"}
        </ButtonText>
      </Pressable>
    </View>
  );
}

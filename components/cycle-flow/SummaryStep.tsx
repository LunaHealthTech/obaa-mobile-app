import { View, Pressable } from "react-native";
import { differenceInCalendarDays, format } from "date-fns";
import { useCycleFlowStore } from "@/repositories/useCycleFlowStore";
import { useCorrectCycle } from "@/viewmodel/useCorrectCycle";
import { useMenstrualProfileViewModel } from "@/viewmodel/useMenstrualProfile";
import { Body, ButtonText, Caption, Label, SectionHeading } from "@/components/Typography";

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between mb-2">
      <Caption className="text-subText">{label}</Caption>
      <Label className="text-mainText">{value}</Label>
    </View>
  );
}

export function SummaryStep() {
  const periodStart = useCycleFlowStore((s) =>
    s.state.mode === "old-cycle-correction" ? s.state.periodStart : "",
  );
  const bleedingEnd = useCycleFlowStore((s) =>
    s.state.mode === "old-cycle-correction" ? s.state.bleedingEnd : "",
  );
  const nextPeriodStart = useCycleFlowStore((s) =>
    s.state.mode === "old-cycle-correction" ? s.state.nextPeriodStart : "",
  );
  const back = useCycleFlowStore((s) => s.back);
  const { save, isSaving } = useCorrectCycle();
  const { data } = useMenstrualProfileViewModel();

  const periodLength =
    differenceInCalendarDays(new Date(bleedingEnd), new Date(periodStart)) + 1;
  const cycleLength =
    nextPeriodStart != null
      ? differenceInCalendarDays(new Date(nextPeriodStart), new Date(periodStart))
      : null;
  const existingCycleLength = data?.general.cycleLength ?? cycleLength;
  const updatedAverage =
    cycleLength != null && existingCycleLength != null
      ? Math.round((existingCycleLength + cycleLength) / 2)
      : null;

  return (
    <View className="bg-white px-6 pt-8 pb-8">
      <SectionHeading className="text-mainText text-center mt-1 mb-1">
        📊 Here's what we updated
      </SectionHeading>
      <Body className="text-subText text-center mb-6">
        We use this to know when this cycle ended.
      </Body>

      <SectionHeading className="text-mainText mb-2">Summary</SectionHeading>
      <SummaryRow
        label="Period started:"
        value={format(new Date(periodStart), "do MMMM, yyyy")}
      />
      <SummaryRow
        label="Bleeding ended:"
        value={format(new Date(bleedingEnd), "do MMMM, yyyy")}
      />
      <SummaryRow
        label="Cycle ended:"
        value={
          nextPeriodStart != null
            ? format(new Date(nextPeriodStart), "do MMMM, yyyy")
            : "Still ongoing"
        }
      />

      <SectionHeading className="text-mainText mt-4 mb-2">
        System-calculated
      </SectionHeading>
      <SummaryRow label="Period length:" value={`${periodLength} days`} />
      {cycleLength != null && (
        <SummaryRow label="Cycle length:" value={`${cycleLength} days`} />
      )}
      {updatedAverage != null && (
        <SummaryRow label="Updated average:" value={`${updatedAverage} days`} />
      )}

      <Pressable
        onPress={() => save()}
        disabled={isSaving}
        className="bg-primaryColor rounded-full py-4 items-center mt-6 mb-3"
      >
        <ButtonText className="text-white">
          {isSaving ? "Saving..." : "Save Changes"}
        </ButtonText>
      </Pressable>
      <Pressable
        onPress={back}
        className="border-2 border-borderGreyColor rounded-full py-4 items-center"
      >
        <ButtonText className="text-mainText">Back</ButtonText>
      </Pressable>
    </View>
  );
}

import { View, Pressable } from "react-native";
import { differenceInCalendarDays, format } from "date-fns";
import { useFixCycleStore } from "@/repositories/useFixCycleStore";
import { useFixCycle } from "@/viewmodel/useFixCycle";
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
  const { periodStart, bleedingEnd, nextPeriodStart, setStep } =
    useFixCycleStore();
  const { save, isSaving } = useFixCycle();
  const { data } = useMenstrualProfileViewModel();

  const periodLength =
    differenceInCalendarDays(new Date(bleedingEnd), new Date(periodStart)) + 1;
  const cycleLength = differenceInCalendarDays(
    new Date(nextPeriodStart),
    new Date(periodStart),
  );
  const existingCycleLength = data?.general.cycleLength ?? cycleLength;
  const updatedAverage = Math.round((existingCycleLength + cycleLength) / 2);

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
        value={format(new Date(nextPeriodStart), "do MMMM, yyyy")}
      />

      <SectionHeading className="text-mainText mt-4 mb-2">
        System-calculated
      </SectionHeading>
      <SummaryRow label="Period length:" value={`${periodLength} days`} />
      <SummaryRow label="Cycle length:" value={`${cycleLength} days`} />
      <SummaryRow label="Updated average:" value={`${updatedAverage} days`} />

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
        onPress={() => setStep("next-period-start")}
        className="border-2 border-borderGreyColor rounded-full py-4 items-center"
      >
        <ButtonText className="text-mainText">Back</ButtonText>
      </Pressable>
    </View>
  );
}

import { useEffect, useRef } from "react";
import type { ComponentType } from "react";
import { Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  BottomSheetModal,
  BottomSheetView,
} from "@expo/ui/community/bottom-sheet";
import { useFixCycleStore } from "@/repositories/useFixCycleStore";
import type { FixCycleStep } from "@/types/menstrual.types";
import { IntroStep } from "./IntroStep";
import { PeriodStartStep } from "./PeriodStartStep";
import { BleedingEndStep } from "./BleedingEndStep";
import { NextPeriodStartStep } from "./NextPeriodStartStep";
import { SummaryStep } from "./SummaryStep";
import { SuccessStep } from "./SuccessStep";

const STEP_COMPONENTS: Record<FixCycleStep, ComponentType> = {
  intro: IntroStep,
  "period-start": PeriodStartStep,
  "bleeding-end": BleedingEndStep,
  "next-period-start": NextPeriodStartStep,
  summary: SummaryStep,
  success: SuccessStep,
};

export function FixCycleSheet() {
  const step = useFixCycleStore((s) => s.step);
  const dismiss = useFixCycleStore((s) => s.dismiss);
  const sheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (step) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [step]);

  const StepComponent = step ? STEP_COMPONENTS[step] : null;

  return (
    <BottomSheetModal
      ref={sheetRef}
      onDismiss={dismiss}
      enableDynamicSizing
      enablePanDownToClose
    >
      <BottomSheetView>
        <Pressable
          onPress={dismiss}
          className="absolute top-4 right-4 z-10 bg-[#00000010] rounded-full p-1"
        >
          <Ionicons name="close" size={18} color="#3A3A3A" />
        </Pressable>
        {StepComponent && <StepComponent />}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

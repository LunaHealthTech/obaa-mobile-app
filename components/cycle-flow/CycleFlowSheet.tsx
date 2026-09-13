import { useEffect, useRef } from "react";
import type { ComponentType } from "react";
import { Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  BottomSheetModal,
  BottomSheetView,
} from "@expo/ui/community/bottom-sheet";
import { useCycleFlowStore } from "@/repositories/useCycleFlowStore";
import type { CorrectionStep, CurrentCycleStep } from "@/types/menstrual.types";
import { IntroStep } from "./IntroStep";
import { PeriodStartStep } from "./PeriodStartStep";
import { BleedingEndStep } from "./BleedingEndStep";
import { NextPeriodStartStep } from "./NextPeriodStartStep";
import { SummaryStep } from "./SummaryStep";
import { SuccessStep } from "./SuccessStep";
import { LogAndCheckInStep } from "./LogAndCheckInStep";
import { NotYetStep } from "./NotYetStep";
import { EndDateStep } from "./EndDateStep";
import { FlowIntensityStep } from "./FlowIntensityStep";
import { SymptomsStep } from "./SymptomsStep";
import { ConfirmationStep } from "./ConfirmationStep";

const CORRECTION_STEP_COMPONENTS: Record<CorrectionStep, ComponentType> = {
  intro: IntroStep,
  "period-start": PeriodStartStep,
  "bleeding-end": BleedingEndStep,
  "next-period-start": NextPeriodStartStep,
  summary: SummaryStep,
  success: SuccessStep,
};

const CURRENT_CYCLE_STEP_COMPONENTS: Record<CurrentCycleStep, ComponentType> = {
  log: LogAndCheckInStep,
  "not-yet": NotYetStep,
  "end-date": EndDateStep,
  "flow-intensity": FlowIntensityStep,
  symptoms: SymptomsStep,
  confirmation: ConfirmationStep,
};

export function CycleFlowSheet() {
  const state = useCycleFlowStore((s) => s.state);
  const close = useCycleFlowStore((s) => s.close);
  const dismiss = useCycleFlowStore((s) => s.dismiss);
  const sheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (state.mode !== "idle") {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [state.mode]);

  const onDismiss = state.mode === "old-cycle-correction" ? dismiss : close;

  let StepComponent: ComponentType | null = null;
  if (state.mode === "current-cycle") {
    StepComponent = CURRENT_CYCLE_STEP_COMPONENTS[state.step];
  } else if (state.mode === "old-cycle-correction") {
    StepComponent = CORRECTION_STEP_COMPONENTS[state.step];
  }

  return (
    <BottomSheetModal
      ref={sheetRef}
      onDismiss={onDismiss}
      enableDynamicSizing
      enablePanDownToClose
    >
      <BottomSheetView>
        <Pressable
          onPress={onDismiss}
          className="absolute top-4 right-4 z-10 bg-[#00000010] rounded-full p-1"
        >
          <Ionicons name="close" size={18} color="#3A3A3A" />
        </Pressable>
        {StepComponent && <StepComponent />}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

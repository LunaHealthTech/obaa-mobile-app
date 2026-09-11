import { useEffect, useRef } from "react";
import type { ComponentType } from "react";
import {
  BottomSheetModal,
  BottomSheetView,
} from "@expo/ui/community/bottom-sheet";
import { usePeriodCheckInStore } from "@/repositories/usePeriodCheckInStore";
import type { PeriodCheckInStep } from "@/types/menstrual.types";
import { QuickCheckInStep } from "./QuickCheckInStep";
import { NotYetStep } from "./NotYetStep";
import { DateStep } from "./DateStep";
import { FlowIntensityStep } from "./FlowIntensityStep";
import { SymptomsStep } from "./SymptomsStep";
import { ConfirmationStep } from "./ConfirmationStep";

const STEP_COMPONENTS: Record<PeriodCheckInStep, ComponentType> = {
  "quick-check-in": QuickCheckInStep,
  "not-yet": NotYetStep,
  date: DateStep,
  "flow-intensity": FlowIntensityStep,
  symptoms: SymptomsStep,
  confirmation: ConfirmationStep,
};

export function PeriodCheckInSheet() {
  const step = usePeriodCheckInStore((s) => s.step);
  const close = usePeriodCheckInStore((s) => s.close);
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
    <BottomSheetModal ref={sheetRef} onDismiss={close} enableDynamicSizing>
      <BottomSheetView>{StepComponent && <StepComponent />}</BottomSheetView>
    </BottomSheetModal>
  );
}

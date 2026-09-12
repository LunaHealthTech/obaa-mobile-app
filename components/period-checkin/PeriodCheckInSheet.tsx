import { useEffect, useRef } from "react";
import type { ComponentType } from "react";
import { Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  BottomSheetModal,
  BottomSheetView,
} from "@expo/ui/community/bottom-sheet";
import { usePeriodCheckInStore } from "@/repositories/usePeriodCheckInStore";
import type { PeriodCheckInStep } from "@/types/menstrual.types";
import { QuickCheckInStep } from "./QuickCheckInStep";
import { NotYetStep } from "./NotYetStep";
import { EndDateStep } from "./EndDateStep";
import { FlowIntensityStep } from "./FlowIntensityStep";
import { SymptomsStep } from "./SymptomsStep";
import { ConfirmationStep } from "./ConfirmationStep";

const STEP_COMPONENTS: Record<PeriodCheckInStep, ComponentType> = {
  "quick-check-in": QuickCheckInStep,
  "not-yet": NotYetStep,
  "end-date": EndDateStep,
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
    <BottomSheetModal
      ref={sheetRef}
      onDismiss={close}
      enableDynamicSizing
      enablePanDownToClose
    >
      <BottomSheetView>
        <Pressable
          onPress={close}
          className="absolute top-4 right-4 z-10 bg-[#00000010] rounded-full p-1"
        >
          <Ionicons name="close" size={18} color="#3A3A3A" />
        </Pressable>
        {StepComponent && <StepComponent />}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

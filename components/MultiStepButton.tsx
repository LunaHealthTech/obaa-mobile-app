import { Pressable, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ButtonText } from "@/components/Typography";

interface MultiStepButtonProps {
  maxSteps: number;
  completionMsg?: string;
  step: number;
  forwardPress: () => void;
  backPress: () => void;
}

export function MultiStepButton({
  forwardPress,
  backPress,
  step,
  maxSteps,
  completionMsg = "Create your account",
}: MultiStepButtonProps) {
  return (
    <View className={"flex gap-4"}>
      <Pressable
        onPress={() => forwardPress()}
        className={
          "bg-primaryColor text-white w-[360px] h-[62px] rounded-full flex items-center justify-center active:opacity-80"
        }
      >
        <ButtonText className={"text-white"}>
          {step === maxSteps ? completionMsg : "Next"}
        </ButtonText>
      </Pressable>

      {step !== 0 && (
        <Pressable
          onPress={() => {
            backPress();
          }}
          className={
            "bg-white w-[360px] h-[62px] border-2 border-primaryColor rounded-full flex items-center justify-center active:opacity-80"
          }
        >
          <View className={" flex flex-row items-center justify-center gap-2"}>
            <FontAwesome name="long-arrow-left" size={24} color="#0F969C" />
            <ButtonText className={"text-primaryColor"}>back</ButtonText>
          </View>
        </Pressable>
      )}
    </View>
  );
}

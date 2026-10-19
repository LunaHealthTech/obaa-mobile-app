import { View, Pressable } from "react-native";
import ObaaBrandMark from "@/assets/icons/obaabrandmark.svg";
import { RadialBackground } from "@/components/RadialBackground";
import { Body, ButtonText, Label } from "@/components/Typography";

type CtaBannerProps = {
  eyebrow: string;
  body: string;
  actionLabel: string;
  onPress: () => void;
};

export function CtaBanner({ eyebrow, body, actionLabel, onPress }: CtaBannerProps) {
  return (
    <View className={"h-[100px] w-full relative flex flex-row"}>
      <RadialBackground colors={["#0FCAD2CC", "#015364"]} />
      <View className={"flex flex-row gap-3 items-center px-2 w-[50%]"}>
        <View>
          <ObaaBrandMark height={40} width={40} />
        </View>
        <View className={"flex-1"}>
          <Label className={"text-white"}>{eyebrow}</Label>
          <Body className={"text-[#CCDDE0] w-[95%] wrap"}>{body}</Body>
        </View>
      </View>
      <View className={"flex flex-col justify-center items-end w-[50%] px-2"}>
        <Pressable
          onPress={onPress}
          accessibilityRole={"button"}
          className={
            "bg-[rgba(255,255,255,0.5)] border-2 border-white rounded-full py-2 px-4 flex flex-row items-center justify-center"
          }
        >
          <ButtonText className={"text-white"}>{actionLabel}</ButtonText>
        </Pressable>
      </View>
    </View>
  );
}
import { View, Image, Pressable } from "react-native";
import ObaaBrandMark from "@/assets/icons/obaabrandmark.svg";
import { RadialBackground } from "@/components/RadialBackground";
import { Body, ButtonText, Label } from "@/components/Typography";

interface ShareCardPropTypes {
  handleClick: () => void;
}

export function ShareCard({ handleClick }: ShareCardPropTypes) {
  return (
    <View className={"h-[100px] w-full relative flex flex-row"}>
      <RadialBackground colors={["#0FCAD2CC", "#015364"]} />
      <View className={"flex flex-row gap-3 items-center px-2 w-[50%]"}>
        <View>
          <ObaaBrandMark height={40} width={40} />
        </View>
        <View>
          <Label className={"text-white"}>
            Share the Love
          </Label>
          <Body className={"text-[#CCDDE0] w-[95%] wrap"}>
            Know someone who’d love a midwife-in-their-pocket?
          </Body>
        </View>
      </View>
      <View className={"flex flex-col justify-center items-end w-[50%] px-2"}>
        <Pressable
          onPress={handleClick}
          className={
            "bg-[rgba(255,255,255,0.5)] text-white border-2 border-white rounded-full w-[100px] py-2 px-2 flex flex-row items-center justify-center"
          }
        >
          <ButtonText className={"text-white"}>Share App</ButtonText>
        </Pressable>
      </View>
    </View>
  );
}

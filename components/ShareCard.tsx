import { View, Image, Text, Pressable } from "react-native";
import ObaaBrandMark from "@/assets/icons/obaabrandmark.svg";
import { RadialBackground } from "@/components/RadialBackground";

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
          <Text className={"text-sm text-white font-semibold"}>
            Share the Love
          </Text>
          <Text className={"text-[#CCDDE0] text-sm w-[95%] wrap"}>
            Know someone who’d love a midwife-in-their-pocket?
          </Text>
        </View>
      </View>
      <View className={"flex flex-col justify-center items-end w-[50%] px-2"}>
        <Pressable
          onPress={handleClick}
          className={
            "bg-[rgba(255,255,255,0.5)] text-white border-2 border-white rounded-full w-[100px] py-2 px-2 text-[13px] flex flex-row items-center justify-center"
          }
        >
          <Text className={"text-white"}>Share App</Text>
        </Pressable>
      </View>
    </View>
  );
}

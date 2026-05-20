import { Image } from "expo-image";
import { Text, View } from "react-native";
import { ladyImage } from "@/constants/assets";

export function ArticleCardSM() {
  return (
    <View
      className={`flex items-center justify-center p-2 gap-3 border border-borderGreyColor rounded-xl w-[271px] h-[230px]`}
      // style={{ opacity: pressed ? 0.5 : 1 }}
    >
      <Image
        source={ladyImage}
        style={{ width: 250, height: 100, borderRadius: 10 }}
        className="w-24 h-24"
        contentFit={"cover"}
        transition={1000}
        alt={"image lady"}
      />
      <View className={"px-2"}>
        <Text className={"capitalize text-mainText font-semibold"}>
          the glow phase: when your skin loves your cycle
        </Text>
        <Text className={"text-greyColor"}>
          Yes, there’s a point in your cycle where your skin naturally shines.
          Here’s how to spot it.
        </Text>
      </View>
    </View>
  );
}

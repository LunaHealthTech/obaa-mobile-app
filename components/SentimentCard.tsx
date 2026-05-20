import { View, Text } from "react-native";
import { EmoticonData } from "@/types/emotion.types";

interface SentimentCardProps {
  sentiment: EmoticonData;
}

export function SentimentCard({ sentiment }: SentimentCardProps) {
  const randMax = Math.random() * (200 - 1) + 1;
  const randn = Math.floor(Math.random() * randMax) + 1;
  return (
    <View className="bg-darkPrimaryColor rounded-xl h-[100px] p-4 w-full relative">
      <Text className={"text-white capitalize font-bold text-xl"}>
        {sentiment.emoji} {sentiment.name}
      </Text>
      <Text className={"text-white"}>
        You are feeling {sentiment.name} with {randn} others
      </Text>
      <View className={"flex flex-row gap-3 items-end justify-end"}>
        <Text className={"text-white text-end text-sm underline mt-4"}>
          Learn more about emotions here
        </Text>
      </View>
    </View>
  );
}

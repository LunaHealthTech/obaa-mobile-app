import { View } from "react-native";
import { EmoticonData } from "@/types/emotion.types";
import { Body, PageTitle } from "@/components/Typography";

interface SentimentCardProps {
  sentiment: EmoticonData;
}

export function SentimentCard({ sentiment }: SentimentCardProps) {
  const randMax = Math.random() * (200 - 1) + 1;
  const randn = Math.floor(Math.random() * randMax) + 1;
  return (
    <View className="bg-darkPrimaryColor rounded-xl h-[100px] p-4 w-full relative">
      <PageTitle className={"text-white capitalize"}>
        {sentiment.emoji} {sentiment.name}
      </PageTitle>
      <Body className={"text-white"}>
        You are feeling {sentiment.name} with {randn} others
      </Body>
      <View className={"flex flex-row gap-3 items-end justify-end"}>
        <Body className={"text-white text-end underline mt-4"}>
          Learn more about emotions here
        </Body>
      </View>
    </View>
  );
}

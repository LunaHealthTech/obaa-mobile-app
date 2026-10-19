import { Pressable, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "@/constants/theme";
import { Caption, CardTitle } from "@/components/Typography";
import { ContentPhoto } from "@/components/content/ContentPhoto";
import { formatCount, type Insight } from "@/lib/content/community";

export function InsightCard({ insight, className = "w-[150px]" }: { insight: Insight; className?: string }) {
  const { topic, readCount } = insight;

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/articles/[slug]", params: { slug: insight.articleSlug } })
      }
      accessibilityRole={"link"}
      className={`bg-white rounded-xl border border-borderGreyColor p-3 gap-2 active:opacity-80 ${className}`}
    >
      <View
        className={"w-10 h-10 rounded-full bg-[#0F969C1A] items-center justify-center overflow-hidden"}
      >
        {topic?.icon ? (
          <ContentPhoto image={topic.icon} aspectRatio={1} className={"w-full"} />
        ) : (
          <Ionicons name={"help-circle-outline"} size={22} color={theme.primaryColor} />
        )}
      </View>
      {topic && (
        <Caption className={"text-greyColor uppercase"} numberOfLines={1}>
          {topic.name}
        </Caption>
      )}
      <CardTitle className={"text-mainText"} numberOfLines={3}>
        {insight.question}
      </CardTitle>
      {readCount !== undefined && (
        <View className={"flex-row items-center gap-1"}>
          <Ionicons name={"bookmark-outline"} size={12} color={theme.greyColor} />
          <Caption className={"text-greyColor"}>{formatCount(readCount)} read</Caption>
        </View>
      )}
    </Pressable>
  );
}
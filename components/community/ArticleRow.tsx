import { Pressable, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatDistanceToNowStrict } from "date-fns";
import { theme } from "@/constants/theme";
import { Caption, CardTitle } from "@/components/Typography";
import { ContentPhoto } from "@/components/content/ContentPhoto";
import { formatCount } from "@/lib/content/community";
import type { Article } from "@/services/contentService";

export function ArticleRow({ article }: { article: Article }) {
  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/articles/[slug]", params: { slug: article.slug } })
      }
      accessibilityRole={"link"}
      className={"flex-row gap-3 items-center active:opacity-80"}
    >
      <View className={"w-[80px] h-[64px] rounded-lg overflow-hidden bg-[#72777A1A]"}>
        {article.header_image && <ContentPhoto image={article.header_image} aspectRatio={80 / 64} />}
      </View>
      <View className={"flex-1 gap-1"}>
        <CardTitle className={"text-mainText"} numberOfLines={2}>
          {article.title}
        </CardTitle>
        <View className={"flex-row items-center gap-3"}>
          <View className={"flex-row items-center gap-1"}>
            <Ionicons name={"time-outline"} size={12} color={theme.greyColor} />
            <Caption className={"text-greyColor"}>
              {formatDistanceToNowStrict(new Date(article.published_at))} ago
            </Caption>
          </View>
          {article.read_count !== undefined && (
            <View className={"flex-row items-center gap-1"}>
              <Ionicons name={"bookmark-outline"} size={12} color={theme.greyColor} />
              <Caption className={"text-greyColor"}>{formatCount(article.read_count)} read</Caption>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
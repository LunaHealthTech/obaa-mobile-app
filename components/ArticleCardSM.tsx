import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Body, CardTitle } from "@/components/Typography";
import { ContentPhoto } from "@/components/content/ContentPhoto";
import type { Article } from "@/services/contentService";

export function ArticleCardSM({ article }: { article: Article }) {
  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/articles/[slug]", params: { slug: article.slug } })
      }
      accessibilityRole={"link"}
      className={
        "p-2 gap-3 border border-borderGreyColor rounded-xl w-[271px] h-[230px] active:opacity-80"
      }
    >
      {article.header_image && (
        <ContentPhoto image={article.header_image} aspectRatio={250 / 100} className={"rounded-[10px]"} />
      )}
      <View className={"px-2 gap-1"}>
        <CardTitle className={"text-mainText"} numberOfLines={2}>
          {article.title}
        </CardTitle>
        {article.insight && (
          <Body className={"text-greyColor"} numberOfLines={3}>
            {article.insight}
          </Body>
        )}
      </View>
    </Pressable>
  );
}

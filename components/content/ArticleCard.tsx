import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Body, Caption, CardTitle } from "@/components/Typography";
import { BookmarkButton } from "@/components/content/BookmarkButton";
import { ContentPhoto } from "@/components/content/ContentPhoto";
import { useContentViewer } from "@/viewmodel/useContent";
import type { Article } from "@/services/contentService";

export function ArticleCard({ article }: { article: Article }) {
  const { signedIn } = useContentViewer();
  const summary = article.insight ?? article.author?.name;

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/articles/[slug]", params: { slug: article.slug } })
      }
      accessibilityRole={"link"}
      className={
        "bg-white rounded-xl border border-borderGreyColor overflow-hidden active:opacity-80"
      }
    >
      {article.header_image && <ContentPhoto image={article.header_image} />}
      <View className={"p-3 gap-1"}>
        <View className={"flex-row items-start gap-3"}>
          <CardTitle className={"text-mainText flex-1"}>{article.title}</CardTitle>
          {signedIn && <BookmarkButton article={article} />}
        </View>
        {summary && (
          <Body className={"text-greyColor"} numberOfLines={2}>
            {summary}
          </Body>
        )}
        <Caption className={"text-greyColor mt-1"}>
          {article.reading_minutes} min read
        </Caption>
      </View>
    </Pressable>
  );
}

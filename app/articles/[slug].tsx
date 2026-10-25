import { Pressable, ScrollView, Share, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import * as Linking from "expo-linking";
import Ionicons from "@expo/vector-icons/Ionicons";
import { format, parseISO } from "date-fns";
import { theme } from "@/constants/theme";
import { Caption, CardTitle, Label, PageTitle, SectionHeading } from "@/components/Typography";
import { BookmarkButton } from "@/components/content/BookmarkButton";
import { CommentsSection } from "@/components/content/CommentsSection";
import { ContentFailureView, ContentLoading } from "@/components/content/ContentStatus";
import { ContentPhoto } from "@/components/content/ContentPhoto";
import { RichText } from "@/components/content/RichText";
import { useArticle } from "@/viewmodel/useContent";
import type { ArticleDetail } from "@/services/contentService";

function shareArticle(article: ArticleDetail) {
  const url = Linking.createURL(`/articles/${article.slug}`);
  return Share.share({ message: `${article.title}\n${url}` });
}

export default function ArticlePage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { article, isLoading, failure, retry } = useArticle(slug);

  if (isLoading) return <ContentLoading />;
  if (!article) {
    return <ContentFailureView failure={failure ?? "unknown"} onRetry={retry} />;
  }

  return (
    <ScrollView
      className={"flex-1 bg-white"}
      keyboardShouldPersistTaps={"handled"}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Stack.Screen
        options={{
          title: "",
          headerRight: () => (
            <View className={"flex-row items-center gap-4"}>
              <Pressable
                onPress={() => shareArticle(article)}
                hitSlop={10}
                accessibilityRole={"button"}
                accessibilityLabel={"Share this article"}
              >
                <Ionicons name={"share-outline"} size={22} color={theme.greyColor} />
              </Pressable>
              <BookmarkButton article={article} />
            </View>
          ),
        }}
      />
      {article.header_image && (
        <ContentPhoto
          image={article.header_image}
          aspectRatio={
            article.header_image.width && article.header_image.height
              ? Math.max(article.header_image.width / article.header_image.height, 4 / 3)
              : 16 / 9
          }
        />
      )}
      <View className={"px-4 pt-4 gap-4"}>
        <PageTitle className={"text-mainText"}>{article.title}</PageTitle>

        <View className={"flex-row items-center gap-3"}>
          {article.author?.profile_image && (
            <ContentPhoto
              image={article.author.profile_image}
              aspectRatio={1}
              className={"w-10 rounded-full"}
            />
          )}
          <View className={"flex-1"}>
            {article.author?.name && <Label className={"text-mainText"}>{article.author.name}</Label>}
            <Caption className={"text-greyColor"}>
              {article.reading_minutes} min read
              {" · "}
              {format(parseISO(article.published_at), "d MMM yyyy")}
            </Caption>
          </View>
        </View>

        {article.tags.length > 0 && (
          <View className={"flex-row flex-wrap gap-2"}>
            {article.tags.map((tag) => (
              <View key={tag.id} className={"bg-[#0F969C1A] rounded-full px-3 py-1"}>
                <Caption className={"text-primaryColor"}>{tag.name}</Caption>
              </View>
            ))}
          </View>
        )}

        <RichText document={article.body} />

        {article.questions.length > 0 && (
          <View className={"gap-2"}>
            <SectionHeading className={"text-mainText"}>Popular questions</SectionHeading>
            {article.questions.map((question) => (
              <View
                key={question}
                className={"flex-row gap-3 items-start border border-borderGreyColor rounded-lg p-3"}
              >
                <Ionicons name={"help-circle-outline"} size={20} color={theme.primaryColor} />
                <CardTitle className={"text-mainText flex-1"}>{question}</CardTitle>
              </View>
            ))}
          </View>
        )}

        <View className={"mt-4"}>
          <CommentsSection articleId={article.id} />
        </View>
      </View>
    </ScrollView>
  );
}

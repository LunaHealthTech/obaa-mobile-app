import { useState } from "react";
import {
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { toast } from "sonner-native";
import { AppHeader } from "@/components/AppHeader";
import { CtaBanner } from "@/components/CtaBanner";
import { Label } from "@/components/Typography";
import { ContentFailureView, ContentLoading } from "@/components/content/ContentStatus";
import { ArticleRow } from "@/components/community/ArticleRow";
import { InsightCard } from "@/components/community/InsightCard";
import { SectionHeader } from "@/components/community/SectionHeader";
import { VideoCard } from "@/components/community/VideoCard";
import { theme } from "@/constants/theme";
import { COMMUNITY_WHATSAPP_URL } from "@/constants/community";
import { useArticleFeed, useInsights, useTags, useVideos } from "@/viewmodel/useContent";

const ARTICLE_PREVIEW_COUNT = 4;

function joinCommunity() {
  // A placeholder invite must never open a broken link.
  if (COMMUNITY_WHATSAPP_URL.includes("REPLACE_ME")) {
    toast("Community link coming soon");
    return;
  }
  Linking.openURL(COMMUNITY_WHATSAPP_URL).catch(() =>
    toast.error("Couldn't open WhatsApp"),
  );
}

export default function Community() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | undefined>();
  const tags = useTags();
  const videos = useVideos({ tag });
  const insights = useInsights({ tag });
  const feed = useArticleFeed({ tag });
  const refreshing = videos.isRefreshing || insights.isRefreshing || feed.isRefreshing;

  const submitSearch = () => {
    const q = query.trim();
    if (q) router.push({ pathname: "/articles", params: { q } });
  };

  return (
    <View className={"flex-1 bg-white"}>
      <AppHeader />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 24 }}
        keyboardShouldPersistTaps={"handled"}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              videos.refresh();
              insights.refresh();
              feed.refresh();
            }}
            tintColor={theme.primaryColor}
          />
        }
      >
        <View className={"gap-3"}>
          <View className={"flex-row items-center gap-3"}>
            <View
              className={
                "flex-1 flex-row items-center gap-2 border border-borderGreyColor rounded-full px-4 h-[46px]"
              }
            >
              <Ionicons name={"search"} size={18} color={theme.greyColor} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={submitSearch}
                placeholder={"Search articles"}
                placeholderTextColor={theme.greyColor}
                returnKeyType={"search"}
                autoCorrect={false}
                className={"flex-1 text-mainText font-sans"}
              />
            </View>
            <Pressable
              onPress={() => router.push("/bookmarks")}
              accessibilityRole={"button"}
              accessibilityLabel={"Bookmarks"}
              className={
                "w-[46px] h-[46px] rounded-lg border border-borderGreyColor items-center justify-center active:opacity-80"
              }
            >
              <Ionicons name={"bookmark-outline"} size={20} color={theme.mainText} />
            </Pressable>
          </View>
          {tags.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {[{ id: undefined, name: "All" }, ...tags].map((t) => {
                const selected = tag === t.id;
                return (
                  <Pressable
                    key={t.id ?? "all"}
                    onPress={() => setTag(t.id)}
                    accessibilityRole={"button"}
                    accessibilityState={{ selected }}
                    className={`rounded-full px-4 py-2 border ${selected ? "bg-[#0F969C1A] border-primaryColor" : "bg-[#F0F0F0] border-[#F0F0F0]"}`}
                  >
                    <Label className={selected ? "text-primaryColor" : "text-mainText"}>
                      {t.name}
                    </Label>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>

        {videos.videos.length > 0 && (
          <View>
            <SectionHeader title={"Edu Content"} />
            <FlatList
              horizontal
              data={videos.videos}
              keyExtractor={(v) => v.id}
              renderItem={({ item }) => <VideoCard video={item} />}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
              onEndReached={videos.loadMore}
            />
          </View>
        )}

        {insights.insights.length > 0 && (
          <View>
            <SectionHeader
              title={"Insights"}
              actionLabel={"Discover More"}
              onAction={() => router.push("/insights")}
            />
            <FlatList
              horizontal
              data={insights.insights}
              keyExtractor={(i) => i.key}
              renderItem={({ item }) => <InsightCard insight={item} />}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
              onEndReached={insights.loadMore}
            />
          </View>
        )}

        <CtaBanner
          eyebrow={"Talk To Your Sisters"}
          body={"Real women. Real stories. Real support."}
          actionLabel={"Join Community"}
          onPress={joinCommunity}
        />

        <View>
          <SectionHeader
            title={"Articles"}
            actionLabel={feed.articles.length > 0 ? "Read More" : undefined}
            onAction={() => router.push("/articles")}
          />
          {feed.isLoading ? (
            <ContentLoading />
          ) : feed.failure && feed.articles.length === 0 ? (
            <ContentFailureView failure={feed.failure} onRetry={feed.refresh} />
          ) : (
            <View className={"gap-4"}>
              {feed.articles.slice(0, ARTICLE_PREVIEW_COUNT).map((a) => (
                <ArticleRow key={a.id} article={a} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { FlatList, Pressable, ScrollView, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "@/constants/theme";
import { Label } from "@/components/Typography";
import { ArticleCard } from "@/components/content/ArticleCard";
import {
  ContentEmpty,
  ContentFailureView,
  ContentLoading,
  StaleBanner,
} from "@/components/content/ContentStatus";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { useArticleFeed, useTags } from "@/viewmodel/useContent";

const SEARCH_DEBOUNCE_MS = 300;

export default function ArticlesPage() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(q ?? "");
  const [tag, setTag] = useState<string | undefined>();
  const search = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
  const tags = useTags();
  const feed = useArticleFeed({ search, tag });

  return (
    <View className={"flex-1 bg-white"}>
      <View className={"px-4 pt-3 gap-3"}>
        <View
          className={
            "flex-row items-center gap-2 border border-borderGreyColor rounded-full px-4 h-[46px]"
          }
        >
          <Ionicons name={"search"} size={18} color={theme.greyColor} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={"Search articles"}
            placeholderTextColor={theme.greyColor}
            returnKeyType={"search"}
            autoCorrect={false}
            className={"flex-1 text-mainText font-sans"}
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => setQuery("")}
              hitSlop={8}
              accessibilityRole={"button"}
              accessibilityLabel={"Clear search"}
            >
              <Ionicons name={"close-circle"} size={18} color={theme.greyColor} />
            </Pressable>
          )}
        </View>
        {tags.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {tags.map((t) => {
              const selected = tag === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setTag(selected ? undefined : t.id)}
                  accessibilityRole={"button"}
                  accessibilityState={{ selected }}
                  className={`rounded-full px-4 py-2 border ${selected ? "bg-primaryColor border-primaryColor" : "bg-white border-borderGreyColor"}`}
                >
                  <Label className={selected ? "text-white" : "text-mainText"}>{t.name}</Label>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>
      {feed.refreshFailedWithCache && <StaleBanner onRetry={feed.refresh} />}
      <FlatList
        data={feed.articles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ArticleCard article={item} />}
        contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
        refreshing={feed.isRefreshing}
        onRefresh={feed.refresh}
        onEndReached={feed.loadMore}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps={"handled"}
        ListEmptyComponent={
          feed.isLoading ? (
            <ContentLoading />
          ) : feed.failure ? (
            <ContentFailureView failure={feed.failure} onRetry={feed.refresh} />
          ) : (
            <ContentEmpty
              icon={"newspaper-outline"}
              title={search ? `No articles match “${search}”` : "No articles yet"}
              body={
                search
                  ? "Try a different word or check the spelling."
                  : "New articles from our midwives will show up here."
              }
            />
          )
        }
        ListFooterComponent={
          feed.isLoadingMore ? (
            <ContentLoading />
          ) : feed.loadMoreFailed ? (
            <Pressable onPress={feed.retryLoadMore} className={"items-center py-3"}>
              <Label className={"text-primaryColor"}>Couldn&apos;t load more. Retry</Label>
            </Pressable>
          ) : null
        }
      />
    </View>
  );
}

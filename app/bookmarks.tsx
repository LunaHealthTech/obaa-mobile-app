import { FlatList, View } from "react-native";
import { ArticleCard } from "@/components/content/ArticleCard";
import {
  ContentEmpty,
  ContentFailureView,
  ContentLoading,
  StaleBanner,
} from "@/components/content/ContentStatus";
import { useBookmarks } from "@/viewmodel/useContent";

export default function BookmarksPage() {
  const { bookmarks, isLoading, failure, refresh, isRefreshing, refreshFailedWithCache } =
    useBookmarks();

  return (
    <View className={"flex-1 bg-white"}>
      {refreshFailedWithCache && <StaleBanner onRetry={refresh} />}
      <FlatList
        data={bookmarks}
        keyExtractor={(item) => item.article_id}
        renderItem={({ item }) => <ArticleCard article={{ ...item.article, bookmarked: true }} />}
        contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
        refreshing={isRefreshing}
        onRefresh={refresh}
        ListEmptyComponent={
          isLoading ? (
            <ContentLoading />
          ) : failure ? (
            <ContentFailureView failure={failure} onRetry={refresh} />
          ) : (
            <ContentEmpty
              icon={"bookmark-outline"}
              title={"No bookmarks yet"}
              body={"Tap the bookmark on an article to save it here for later."}
            />
          )
        }
      />
    </View>
  );
}

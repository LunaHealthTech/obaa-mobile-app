import { FlatList, Pressable, View } from "react-native";
import { Label } from "@/components/Typography";
import {
  ContentEmpty,
  ContentFailureView,
  ContentLoading,
  StaleBanner,
} from "@/components/content/ContentStatus";
import { InsightCard } from "@/components/community/InsightCard";
import { useInsights } from "@/viewmodel/useContent";

export default function InsightsPage() {
  const feed = useInsights({});

  return (
    <View className={"flex-1 bg-white"}>
      {feed.refreshFailedWithCache && <StaleBanner onRetry={feed.refresh} />}
      <FlatList
        data={feed.insights}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => <InsightCard insight={item} className={"w-full"} />}
        contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
        refreshing={feed.isRefreshing}
        onRefresh={feed.refresh}
        onEndReached={feed.loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          feed.isLoading ? (
            <ContentLoading />
          ) : feed.failure ? (
            <ContentFailureView failure={feed.failure} onRetry={feed.refresh} />
          ) : (
            <ContentEmpty
              icon={"help-circle-outline"}
              title={"No insights yet"}
              body={"Answers to everyday health questions will show up here."}
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
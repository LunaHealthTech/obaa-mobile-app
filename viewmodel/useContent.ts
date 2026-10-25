import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  type QueryKey,
} from "@tanstack/react-query";
import { router } from "expo-router";
import { toast } from "sonner-native";
import { queryClient } from "@/lib/queryClient";
import { applyBookmark, contentKeys } from "@/lib/content/cache";
import {
  FAILURE_COPY,
  classifyContentError,
  type ContentFailure,
} from "@/lib/content/errors";
import { useAuthStore } from "@/repositories/useAuthStore";
import {
  bookmarkArticle,
  getArticleBySlug,
  getBookmarks,
  getComments,
  getPrivacyPolicy,
  listContent,
  postComment,
  unbookmarkArticle,
  type Article,
  type ContentFilters,
  type ContentKinds,
} from "@/services/contentService";

// Content is refreshed server-side every 5 minutes, so the global staleTime
// fits. A longer gcTime keeps cached content readable after a short trip offline.
const GC_TIME = 1000 * 60 * 30;

export function useContentViewer() {
  const user = useAuthStore((s) => s.user);
  const signedIn = useAuthStore((s) => s.status === "authenticated");
  return {
    viewer: user?.uuid ?? "anon",
    signedIn,
    verified: user?.email_verified ?? false,
    email: user?.email ?? "",
  };
}

export function reportContentFailure(failure: ContentFailure, email?: string) {
  const { title, action } = FAILURE_COPY[failure];
  toast.error(title, {
    action:
      action === "sign-in"
        ? { label: "Sign in", onClick: () => router.push("/signin") }
        : action === "verify-email"
          ? {
              label: "Verify",
              onClick: () =>
                router.push({ pathname: "/verify-email", params: { email } }),
            }
          : undefined,
  });
}

function usePagedList<K extends "articles" | "events">(
  kind: K,
  queryKey: QueryKey,
  filters: ContentFilters[K],
) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => listContent(kind, filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => last.nextPage ?? undefined,
    gcTime: GC_TIME,
  });
  const items = (query.data?.pages.flatMap((p) => p.items) ?? []) as ContentKinds[K][];
  const loadMoreFailed = query.isFetchNextPageError;

  return {
    items,
    count: query.data?.pages[0]?.count ?? 0,
    isLoading: query.isLoading,
    failure: query.isError && !query.data ? classifyContentError(query.error) : null,
    refresh: () => query.refetch(),
    isRefreshing: query.isRefetching && !query.isFetchingNextPage,
    refreshFailedWithCache: query.isRefetchError && !loadMoreFailed,
    hasMore: query.hasNextPage,
    isLoadingMore: query.isFetchingNextPage,
    loadMoreFailed,
    // A failed page is retried only by the user, so a bad connection can't loop.
    loadMore: () => {
      if (query.hasNextPage && !query.isFetchingNextPage && !loadMoreFailed) {
        query.fetchNextPage();
      }
    },
    retryLoadMore: () => query.fetchNextPage(),
  };
}

export function useArticleFeed(filters: ContentFilters["articles"]) {
  const { viewer } = useContentViewer();
  const { items, ...rest } = usePagedList(
    "articles",
    contentKeys.articles(viewer, filters),
    filters,
  );
  return { articles: items, ...rest };
}

export function useEvents(scope: "upcoming" | "past") {
  const { items, ...rest } = usePagedList("events", contentKeys.events(scope), { scope });
  return { events: items, ...rest };
}

export function useTags() {
  const { data } = useQuery({
    queryKey: contentKeys.tags,
    queryFn: () => listContent("tags", {}, 1, 50),
    gcTime: GC_TIME,
  });
  return data?.items ?? [];
}

export function useArticle(slug: string) {
  const { viewer } = useContentViewer();
  const query = useQuery({
    queryKey: contentKeys.article(viewer, slug),
    queryFn: () => getArticleBySlug(slug),
    gcTime: GC_TIME,
  });
  return {
    article: query.data ?? null,
    isLoading: query.isLoading,
    failure: query.isError && !query.data ? classifyContentError(query.error) : null,
    retry: () => query.refetch(),
  };
}

export function usePrivacyPolicy() {
  const query = useQuery({
    queryKey: contentKeys.privacyPolicy,
    queryFn: getPrivacyPolicy,
    gcTime: GC_TIME,
  });
  return {
    policy: query.data ?? null,
    isLoading: query.isLoading,
    failure: query.isError && !query.data ? classifyContentError(query.error) : null,
    retry: () => query.refetch(),
  };
}

export function useBookmarks() {
  const { viewer, signedIn } = useContentViewer();
  const query = useQuery({
    queryKey: contentKeys.bookmarks(viewer),
    queryFn: getBookmarks,
    enabled: signedIn,
    gcTime: GC_TIME,
  });
  return {
    bookmarks: query.data ?? [],
    isLoading: query.isLoading,
    failure: query.isError && !query.data ? classifyContentError(query.error) : null,
    refresh: () => query.refetch(),
    isRefreshing: query.isRefetching,
    refreshFailedWithCache: query.isRefetchError,
  };
}

const BOOKMARK_PREFIXES = [["content", "articles"], ["content", "article"], ["bookmarks"]];

export function useToggleBookmark() {
  const { signedIn, email } = useContentViewer();

  return async (article: Article) => {
    if (!signedIn) {
      reportContentFailure("sign-in");
      return;
    }
    const value = !article.bookmarked;
    await Promise.all(
      BOOKMARK_PREFIXES.map((queryKey) => queryClient.cancelQueries({ queryKey })),
    );
    const rollback = applyBookmark(queryClient, article, value, new Date().toISOString());
    try {
      await (value ? bookmarkArticle : unbookmarkArticle)(article.id);
    } catch (error) {
      rollback();
      reportContentFailure(classifyContentError(error), email);
    } finally {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    }
  };
}

export function useComments(articleId: string) {
  const query = useQuery({
    queryKey: contentKeys.comments(articleId),
    queryFn: () => getComments(articleId),
    gcTime: GC_TIME,
  });
  return {
    comments: query.data ?? [],
    isLoading: query.isLoading,
    failure: query.isError && !query.data ? classifyContentError(query.error) : null,
    retry: () => query.refetch(),
  };
}

export function usePostComment(articleId: string) {
  const { email } = useContentViewer();
  const mutation = useMutation({
    mutationFn: (input: { content: string; replying_to?: number }) =>
      postComment(articleId, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: contentKeys.comments(articleId) }),
  });

  return {
    isPosting: mutation.isPending,
    post: async (content: string, replyingTo?: number) => {
      try {
        await mutation.mutateAsync({ content, replying_to: replyingTo });
        return true;
      } catch (error) {
        reportContentFailure(classifyContentError(error), email);
        return false;
      }
    },
  };
}

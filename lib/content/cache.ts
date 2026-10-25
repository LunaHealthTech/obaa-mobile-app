import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type {
  Article,
  ArticleDetail,
  Bookmark,
  ContentFilters,
  Page,
} from "../../services/contentService.ts";

// `viewer` is the signed-in user's uuid or "anon". `bookmarked` in a response
// depends on the token, so keying by viewer keeps the cache correct across
// sign-in and sign-out without any invalidation.
export const contentKeys = {
  all: ["content"] as const,
  articles: (viewer: string, filters: ContentFilters["articles"]) =>
    ["content", "articles", viewer, filters] as const,
  article: (viewer: string, slug: string) => ["content", "article", viewer, slug] as const,
  tags: ["content", "tags"] as const,
  questions: (tag: string | undefined) => ["content", "questions", tag] as const,
  videos: (tag: string | undefined) => ["content", "videos", tag] as const,
  events: (scope: "upcoming" | "past") => ["content", "events", scope] as const,
  privacyPolicy: ["content", "privacy-policy"] as const,
  bookmarks: (viewer: string) => ["bookmarks", viewer] as const,
  comments: (articleId: string) => ["comments", articleId] as const,
};

export function setBookmarkedInFeed(
  data: InfiniteData<Page<Article>> | undefined,
  articleId: string,
  value: boolean,
) {
  const stale = (a: Article) => a.id === articleId && a.bookmarked !== value;
  if (!data || !data.pages.some((p) => p.items.some(stale))) return data;
  return {
    ...data,
    pages: data.pages.map((page) =>
      page.items.some(stale)
        ? {
            ...page,
            items: page.items.map((a) => (stale(a) ? { ...a, bookmarked: value } : a)),
          }
        : page,
    ),
  };
}

export function setBookmarkedInDetail(
  data: ArticleDetail | undefined,
  articleId: string,
  value: boolean,
) {
  if (!data || data.id !== articleId || data.bookmarked === value) return data;
  return { ...data, bookmarked: value };
}

export function toggleInBookmarks(
  list: Bookmark[] | undefined,
  article: Article,
  value: boolean,
  now: string,
) {
  if (!list) return list;
  const present = list.some((b) => b.article_id === article.id);
  if (value === present) return list;
  if (!value) return list.filter((b) => b.article_id !== article.id);
  return [
    { article_id: article.id, created_at: now, article: { ...article, bookmarked: true } },
    ...list,
  ];
}

// Applies a bookmark toggle to every cached feed, detail and bookmarks list,
// and returns a function that puts all of them back exactly as they were.
export function applyBookmark(
  client: QueryClient,
  article: Article,
  value: boolean,
  now: string,
): () => void {
  const snapshots = [
    ...client.getQueriesData({ queryKey: ["content", "articles"] }),
    ...client.getQueriesData({ queryKey: ["content", "article"] }),
    ...client.getQueriesData({ queryKey: ["bookmarks"] }),
  ];
  client.setQueriesData<InfiniteData<Page<Article>>>(
    { queryKey: ["content", "articles"] },
    (d) => setBookmarkedInFeed(d, article.id, value),
  );
  client.setQueriesData<ArticleDetail>({ queryKey: ["content", "article"] }, (d) =>
    setBookmarkedInDetail(d, article.id, value),
  );
  client.setQueriesData<Bookmark[]>({ queryKey: ["bookmarks"] }, (d) =>
    toggleInBookmarks(d, article, value, now),
  );
  return () => {
    for (const [key, data] of snapshots) client.setQueryData(key, data);
  };
}

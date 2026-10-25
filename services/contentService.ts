import type { Document } from "@contentful/rich-text-types";
import { apiClient, extractErrorCode } from "@/lib/apiClient";
import { nextPageFromUrl } from "@/lib/content/pagination";

export type ContentImage = {
  url: string;
  content_type: string | null;
  width: number | null;
  height: number | null;
  title: string | null;
  description: string | null;
};
export type Author = { id: string; name: string | null; profile_image: ContentImage | null };
export type Tag = { id: string; name: string | null };
export type Article = {
  id: string;
  slug: string;
  title: string;
  insight: string | null;
  header_image: ContentImage | null;
  author: Author | null;
  tags: Tag[];
  reading_minutes: number;
  published_at: string;
  updated_at: string;
  comment_count: number;
  bookmarked?: boolean;
};
export type ArticleDetail = Article & { body: Document | null; questions: string[] };
export type ContentEvent = {
  id: string;
  name: string | null;
  description: string | null;
  starts_at: string | null;
  venue: { lat: number; lon: number } | null;
  flyer: ContentImage | null;
  online_link: string | null;
};
export type PopularQuestion = {
  id: string;
  questions: string[];
  article: { id: string; slug: string; title: string } | null;
};
export type Video = { id: string; reel: ContentImage | null };
export type PrivacyPolicy = { id: string; body: Document | null; updated_at: string };
export type Bookmark = { article_id: string; created_at: string; article: Article };
export type CommentAuthor = {
  user: { username: string; display_name: string | null; profile_pic: string | null };
};
export type ArticleComment = {
  id: number;
  article: string;
  author: CommentAuthor | null;
  content: string;
  replying_to: number | null;
  created_at: string;
};

export type ContentKinds = {
  articles: Article;
  authors: Author;
  tags: Tag;
  events: ContentEvent;
  questions: PopularQuestion;
  videos: Video;
};
export type ContentFilters = {
  articles: { search?: string; tag?: string; author?: string };
  events: { scope?: "upcoming" | "past" };
  authors: Record<string, never>;
  tags: Record<string, never>;
  questions: Record<string, never>;
  videos: Record<string, never>;
};
export type Page<T> = { count: number; items: T[]; nextPage: number | null };

const DEFAULT_PAGE_SIZE = 20;

// A 400 invalid-value means the app sent a bad request, which is our bug.
async function request<T>(
  method: "get" | "post" | "delete",
  url: string,
  options: { params?: Record<string, unknown>; data?: unknown } = {},
): Promise<T> {
  try {
    const res = await apiClient.request<T>({ method, url, ...options });
    return res.data;
  } catch (error) {
    if (extractErrorCode(error) === "invalid-value") {
      console.error("[contentService] invalid request", method, url, options);
    }
    throw error;
  }
}

export async function listContent<K extends keyof ContentKinds>(
  kind: K,
  filters: ContentFilters[K],
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<Page<ContentKinds[K]>> {
  const params: Record<string, unknown> = { page, page_size: pageSize };
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params[key] = value;
  }
  const data = await request<{
    count: number;
    next: string | null;
    results: ContentKinds[K][];
  }>("get", `/content/${kind}/`, { params });
  return { count: data.count, items: data.results, nextPage: nextPageFromUrl(data.next) };
}

export const getArticleBySlug = (slug: string) =>
  request<ArticleDetail>("get", `/content/articles/slug/${encodeURIComponent(slug)}/`);

export const getPrivacyPolicy = () => request<PrivacyPolicy>("get", "/content/privacy-policy/");

export const getBookmarks = () => request<Bookmark[]>("get", "/article/bookmarks/");

export async function bookmarkArticle(articleId: string) {
  await request("post", `/article/bookmark/${articleId}/`);
}

export async function unbookmarkArticle(articleId: string) {
  await request("delete", `/article/bookmark/${articleId}/`);
}

export const getComments = (articleId: string) =>
  request<ArticleComment[]>("get", `/article/comments/${articleId}/`);

export const postComment = (
  articleId: string,
  input: { content: string; replying_to?: number },
) => request<ArticleComment>("post", `/article/comments/${articleId}/`, { data: input });

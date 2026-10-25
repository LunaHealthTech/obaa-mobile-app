import type { InsightTopic, PopularQuestion, Video } from "../../services/contentService.ts";

export type Insight = {
  key: string;
  question: string;
  topic: InsightTopic | null;
  articleSlug: string;
  readCount: number | undefined;
};

export function playableVideos(videos: Video[]) {
  return videos.filter((v) => v.reel !== null);
}

// An insight without its answering article has nowhere to go, so it is dropped.
export function toInsights(questions: PopularQuestion[]): Insight[] {
  return questions.flatMap((q) => {
    const article = q.article;
    if (!article) return [];
    return q.questions.map((question, i) => ({
      key: `${q.id}:${i}`,
      question,
      topic: q.topic ?? null,
      articleSlug: article.slug,
      readCount: article.read_count,
    }));
  });
}

export function formatCount(n: number): string {
  const compact = (value: number, unit: string) =>
    `${Number.parseFloat(value.toFixed(1))}${unit}`;
  if (n < 1000) return String(n);
  if (n < 999_950) return compact(n / 1000, "K");
  return compact(n / 1_000_000, "M");
}

import { test } from "node:test";
import assert from "node:assert/strict";
import { formatCount, playableVideos, toInsights } from "./community.ts";

const video = (id, reel) => ({ id, reel });
const reel = { url: "//x/y.mp4", content_type: "video/mp4", width: null, height: null, title: null, description: null };

test("videos without a reel are not playable", () => {
  const kept = playableVideos([video("a", null), video("b", reel)]);
  assert.deepEqual(kept.map((v) => v.id), ["b"]);
});

test("each question becomes its own insight card linked to its article", () => {
  const topic = { id: "t", name: "Bloating", icon: null };
  const insights = toInsights([
    {
      id: "q1",
      questions: ["Why do I bloat?", "Is it normal?"],
      topic,
      article: { id: "a1", slug: "bloating", title: "Bloating", read_count: 1500 },
    },
  ]);
  assert.deepEqual(insights, [
    { key: "q1:0", question: "Why do I bloat?", topic, articleSlug: "bloating", readCount: 1500 },
    { key: "q1:1", question: "Is it normal?", topic, articleSlug: "bloating", readCount: 1500 },
  ]);
});

test("insights without an article are dropped and a missing topic or count stays empty", () => {
  const insights = toInsights([
    { id: "q1", questions: ["Orphan?"], article: null },
    { id: "q2", questions: ["Plain?"], article: { id: "a", slug: "s", title: "T" } },
  ]);
  assert.equal(insights.length, 1);
  assert.equal(insights[0].topic, null);
  assert.equal(insights[0].readCount, undefined);
});

test("counts are abbreviated", () => {
  assert.equal(formatCount(0), "0");
  assert.equal(formatCount(950), "950");
  assert.equal(formatCount(1000), "1K");
  assert.equal(formatCount(1500), "1.5K");
  assert.equal(formatCount(2000), "2K");
  assert.equal(formatCount(999_999), "1M");
  assert.equal(formatCount(1_200_000), "1.2M");
});

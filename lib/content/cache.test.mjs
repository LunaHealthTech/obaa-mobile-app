import { test } from "node:test";
import assert from "node:assert/strict";
import { QueryClient } from "@tanstack/react-query";
import {
  applyBookmark,
  contentKeys,
  setBookmarkedInDetail,
  setBookmarkedInFeed,
  toggleInBookmarks,
} from "./cache.ts";

const article = (id, bookmarked) => ({
  id,
  slug: `slug-${id}`,
  title: `t${id}`,
  bookmarked,
});
const feed = () => ({
  pageParams: [1, 2],
  pages: [
    { count: 3, nextPage: 2, items: [article("a", false), article("b", false)] },
    { count: 3, nextPage: null, items: [article("c", false)] },
  ],
});

test("feed updater flips only the matching article, across pages", () => {
  const before = feed();
  const after = setBookmarkedInFeed(before, "c", true);
  assert.equal(after.pages[1].items[0].bookmarked, true);
  assert.equal(after.pages[0], before.pages[0]);
  assert.equal(before.pages[1].items[0].bookmarked, false);
});

test("feed updater returns the input when nothing matches or nothing changes", () => {
  const before = feed();
  assert.equal(setBookmarkedInFeed(before, "zzz", true), before);
  assert.equal(setBookmarkedInFeed(before, "a", false), before);
  assert.equal(setBookmarkedInFeed(undefined, "a", true), undefined);
});

test("detail updater only touches the same article", () => {
  const detail = { ...article("a", false), body: null, questions: [] };
  assert.equal(setBookmarkedInDetail(detail, "a", true).bookmarked, true);
  assert.equal(setBookmarkedInDetail(detail, "other", true), detail);
  assert.equal(setBookmarkedInDetail(undefined, "a", true), undefined);
});

test("bookmarks updater prepends on add, removes on remove, ignores no-ops", () => {
  const existing = [{ article_id: "b", created_at: "t0", article: article("b", true) }];
  const added = toggleInBookmarks(existing, article("a", false), true, "now");
  assert.deepEqual(added.map((b) => b.article_id), ["a", "b"]);
  assert.equal(added[0].created_at, "now");
  assert.equal(added[0].article.bookmarked, true);
  assert.equal(toggleInBookmarks(added, article("a", false), true, "later"), added);
  assert.deepEqual(toggleInBookmarks(added, article("a", true), false, "x").map((b) => b.article_id), ["b"]);
  assert.equal(toggleInBookmarks(existing, article("zzz", false), false, "x"), existing);
  assert.equal(toggleInBookmarks(undefined, article("a", false), true, "x"), undefined);
});

test("applyBookmark updates every cached view and rollback restores all of them", () => {
  const client = new QueryClient();
  const feedKey = contentKeys.articles("u1", { search: "x" });
  const otherFeedKey = contentKeys.articles("anon", {});
  const detailKey = contentKeys.article("u1", "slug-a");
  const bookmarksKey = contentKeys.bookmarks("u1");
  const eventsKey = contentKeys.events("past");
  const originals = {
    feed: feed(),
    other: feed(),
    detail: { ...article("a", false), body: null, questions: [] },
    bookmarks: [],
    events: [{ id: "e" }],
  };
  client.setQueryData(feedKey, originals.feed);
  client.setQueryData(otherFeedKey, originals.other);
  client.setQueryData(detailKey, originals.detail);
  client.setQueryData(bookmarksKey, originals.bookmarks);
  client.setQueryData(eventsKey, originals.events);

  const rollback = applyBookmark(client, article("a", false), true, "now");

  assert.equal(client.getQueryData(feedKey).pages[0].items[0].bookmarked, true);
  assert.equal(client.getQueryData(otherFeedKey).pages[0].items[0].bookmarked, true);
  assert.equal(client.getQueryData(detailKey).bookmarked, true);
  assert.deepEqual(client.getQueryData(bookmarksKey).map((b) => b.article_id), ["a"]);
  assert.equal(client.getQueryData(eventsKey), originals.events);

  rollback();

  assert.deepEqual(client.getQueryData(feedKey), originals.feed);
  assert.deepEqual(client.getQueryData(otherFeedKey), originals.other);
  assert.deepEqual(client.getQueryData(detailKey), originals.detail);
  assert.deepEqual(client.getQueryData(bookmarksKey), []);
});

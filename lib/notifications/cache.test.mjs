import { test } from "node:test";
import assert from "node:assert/strict";
import { QueryClient } from "@tanstack/react-query";
import {
  insertNotification,
  markAllRead,
  markRead,
  notificationsQueryKey,
  optimistic,
} from "./cache.ts";

const note = (id, readAt = null) => ({
  id,
  kind: "LATE_PERIOD",
  severity: "WARNING",
  title: `t${id}`,
  body: "b",
  cta: null,
  readAt,
  createdAt: "2026-10-01T00:00:00Z",
});

test("socket insert prepends a new unread notification and bumps the count", () => {
  const state = insertNotification({ unreadCount: 1, results: [note(1)] }, note(2));
  assert.deepEqual(state.results.map((n) => n.id), [2, 1]);
  assert.equal(state.unreadCount, 2);
});

test("socket insert of an id already in the cache changes nothing", () => {
  const before = { unreadCount: 1, results: [note(1)] };
  const after = insertNotification(before, note(1));
  assert.equal(after.unreadCount, 1);
  assert.equal(after.results.length, 1);
});

test("socket insert into an empty cache starts the list", () => {
  const state = insertNotification(undefined, note(7));
  assert.deepEqual(state, { unreadCount: 1, results: [note(7)] });
});

test("socket insert of an already-read notification leaves the count alone", () => {
  const state = insertNotification({ unreadCount: 0, results: [] }, note(3, "2026-10-02T00:00:00Z"));
  assert.equal(state.unreadCount, 0);
});

test("markRead decrements once and is a no-op on an already-read item", () => {
  const once = markRead({ unreadCount: 2, results: [note(1), note(2)] }, 1, "now");
  assert.equal(once.unreadCount, 1);
  assert.equal(once.results[0].readAt, "now");
  const twice = markRead(once, 1, "later");
  assert.equal(twice.unreadCount, 1);
  assert.equal(twice.results[0].readAt, "now");
});

test("markAllRead zeroes the count and keeps existing read timestamps", () => {
  const state = markAllRead({ unreadCount: 1, results: [note(1), note(2, "earlier")] }, "now");
  assert.equal(state.unreadCount, 0);
  assert.deepEqual(state.results.map((n) => n.readAt), ["now", "earlier"]);
});

test("optimistic read updates the cache and rollback restores it on failure", () => {
  const client = new QueryClient();
  const original = { unreadCount: 1, results: [note(1)] };
  client.setQueryData(notificationsQueryKey, original);

  const rollback = optimistic(client, notificationsQueryKey, (s) => markRead(s, 1, "now"));
  assert.equal(client.getQueryData(notificationsQueryKey).unreadCount, 0);

  rollback();
  assert.deepEqual(client.getQueryData(notificationsQueryKey), original);
});

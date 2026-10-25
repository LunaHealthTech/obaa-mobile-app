import { test } from "node:test";
import assert from "node:assert/strict";
import { nextPageFromUrl } from "./pagination.ts";

test("the page number is read from the absolute next url", () => {
  assert.equal(
    nextPageFromUrl("http://localhost:8000/api/v1/content/articles/?page=2&page_size=2"),
    2,
  );
  assert.equal(nextPageFromUrl("http://h/x/?page_size=20&page=13"), 13);
});

test("no next url means no next page", () => {
  assert.equal(nextPageFromUrl(null), null);
  assert.equal(nextPageFromUrl(undefined), null);
  assert.equal(nextPageFromUrl("http://h/x/?page_size=20"), null);
});

test("page_size alone is not mistaken for page", () => {
  assert.equal(nextPageFromUrl("http://h/x/?mypage=3"), null);
});

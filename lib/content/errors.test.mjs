import { test } from "node:test";
import assert from "node:assert/strict";
import { FAILURE_COPY, classifyContentError } from "./errors.ts";

const http = (status, data = {}) => ({ isAxiosError: true, response: { status, data } });

test("a 404 with the content code is not-found", () => {
  assert.equal(
    classifyContentError(http(404, { code: "content/not-found", message: "gone" })),
    "not-found",
  );
});

test("status codes map to their failures", () => {
  assert.equal(classifyContentError(http(503)), "unavailable");
  assert.equal(classifyContentError(http(429)), "throttled");
  assert.equal(classifyContentError(http(401, { code: "not_authenticated" })), "sign-in");
  assert.equal(classifyContentError(http(403)), "verify-email");
  assert.equal(classifyContentError(http(500)), "unknown");
  assert.equal(classifyContentError(http(404, { code: "something-else" })), "unknown");
});

test("an axios error with no response is offline", () => {
  assert.equal(classifyContentError({ isAxiosError: true }), "offline");
});

test("a non-axios error is unknown", () => {
  assert.equal(classifyContentError(new Error("boom")), "unknown");
  assert.equal(classifyContentError(undefined), "unknown");
});

test("not-found copy names the removed article and offers no retry", () => {
  assert.equal(FAILURE_COPY["not-found"].title, "This article is no longer available");
  assert.equal(FAILURE_COPY["not-found"].action, null);
  assert.equal(FAILURE_COPY["sign-in"].action, "sign-in");
  assert.equal(FAILURE_COPY["verify-email"].action, "verify-email");
});

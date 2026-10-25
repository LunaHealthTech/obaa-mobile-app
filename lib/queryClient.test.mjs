import { after, test } from "node:test";
import assert from "node:assert/strict";
import { AxiosError } from "axios";
import { queryClient } from "./queryClient.ts";

const failingWith = (status) => {
  let calls = 0;
  const queryFn = async () => {
    calls++;
    throw new AxiosError("fail", String(status), undefined, undefined, {
      status,
      data: {},
      statusText: "",
      headers: {},
      config: { headers: {} },
    });
  };
  return { queryFn, calls: () => calls };
};

after(() => queryClient.clear());

test("a 4xx answer is not retried", async () => {
  const q = failingWith(404);
  await queryClient
    .fetchQuery({ queryKey: ["retry-404"], queryFn: q.queryFn, retryDelay: 0 })
    .catch(() => {});
  assert.equal(q.calls(), 1);
});

test("a server error is retried twice", async () => {
  const q = failingWith(500);
  await queryClient
    .fetchQuery({ queryKey: ["retry-500"], queryFn: q.queryFn, retryDelay: 0 })
    .catch(() => {});
  assert.equal(q.calls(), 3);
});

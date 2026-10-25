import { test } from "node:test";
import assert from "node:assert/strict";
import { embeddedAsset, sizedImageUrl } from "./image.ts";

test("sizedImageUrl scales the width by pixel ratio and requests webp", () => {
  assert.equal(
    sizedImageUrl("https://images.ctfassets.net/a.jpg", 400, 2),
    "https://images.ctfassets.net/a.jpg?w=800&fm=webp&q=80",
  );
});

test("sizedImageUrl rounds fractional widths and caps at 4000", () => {
  assert.match(sizedImageUrl("https://x/a.jpg", 411.4, 2.625), /\?w=1080&/);
  assert.match(sizedImageUrl("https://x/a.jpg", 3000, 3), /\?w=4000&/);
});

test("sizedImageUrl appends with & when the url already has a query", () => {
  assert.equal(
    sizedImageUrl("https://x/a.jpg?v=1", 100, 1),
    "https://x/a.jpg?v=1&w=100&fm=webp&q=80",
  );
});

const asset = {
  sys: { type: "Asset" },
  fields: {
    title: "Pic",
    description: "A pic",
    file: {
      url: "//images.ctfassets.net/a/b/pic.png",
      contentType: "image/png",
      details: { image: { width: 10, height: 20 } },
    },
  },
};

test("embeddedAsset normalises a raw asset and adds the https prefix", () => {
  assert.deepEqual(embeddedAsset(asset), {
    url: "https://images.ctfassets.net/a/b/pic.png",
    content_type: "image/png",
    width: 10,
    height: 20,
    title: "Pic",
    description: "A pic",
  });
});

test("embeddedAsset returns null for unresolved links and junk", () => {
  assert.equal(embeddedAsset({ sys: { type: "Link", linkType: "Asset", id: "x" } }), null);
  assert.equal(embeddedAsset(undefined), null);
  assert.equal(embeddedAsset("nope"), null);
});

test("embeddedAsset tolerates a file with no dimensions", () => {
  const out = embeddedAsset({ fields: { file: { url: "https://x/v.mp4" } } });
  assert.equal(out.width, null);
  assert.equal(out.content_type, null);
});

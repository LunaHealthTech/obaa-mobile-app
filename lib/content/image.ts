import type { ContentImage } from "../../services/contentService.ts";

const MAX_WIDTH = 4000;

export function sizedImageUrl(url: string, widthDp: number, pixelRatio: number): string {
  const width = Math.min(MAX_WIDTH, Math.round(widthDp * pixelRatio));
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}w=${width}&fm=webp&q=80`;
}

type RawAsset = {
  fields?: {
    title?: unknown;
    description?: unknown;
    file?: {
      url?: unknown;
      contentType?: unknown;
      details?: { image?: { width?: unknown; height?: unknown } };
    };
  };
};

const text = (value: unknown) => (typeof value === "string" ? value : null);
const num = (value: unknown) => (typeof value === "number" ? value : null);

// Embedded nodes carry the raw resolved asset. An unresolved target is a bare
// Link with no `fields`, which yields null.
export function embeddedAsset(target: unknown): ContentImage | null {
  const fields = (target as RawAsset | null)?.fields;
  const url = text(fields?.file?.url);
  if (!url) return null;
  const dimensions = fields?.file?.details?.image;
  return {
    url: url.startsWith("//") ? `https:${url}` : url,
    content_type: text(fields?.file?.contentType),
    width: num(dimensions?.width),
    height: num(dimensions?.height),
    title: text(fields?.title),
    description: text(fields?.description),
  };
}

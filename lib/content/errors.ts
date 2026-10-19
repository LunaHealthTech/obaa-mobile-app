import { isAxiosError } from "axios";

export type ContentFailure =
  | "not-found"
  | "unavailable"
  | "throttled"
  | "offline"
  | "sign-in"
  | "verify-email"
  | "unknown";

export function classifyContentError(error: unknown): ContentFailure {
  if (!isAxiosError(error)) return "unknown";
  if (!error.response) return "offline";
  const { status } = error.response;
  // Bookmark endpoints answer a removed article with a bare 404, not content/not-found.
  if (status === 404) return "not-found";
  if (status === 503) return "unavailable";
  if (status === 429) return "throttled";
  if (status === 401) return "sign-in";
  if (status === 403) return "verify-email";
  return "unknown";
}

export const FAILURE_COPY: Record<
  ContentFailure,
  { title: string; body: string; action: "retry" | "sign-in" | "verify-email" | null }
> = {
  "not-found": {
    title: "This article is no longer available",
    body: "It may have been removed or the link may be out of date.",
    action: null,
  },
  unavailable: {
    title: "Content is temporarily unavailable",
    body: "We're having trouble loading this right now. Please try again in a moment.",
    action: "retry",
  },
  throttled: {
    title: "Too many requests",
    body: "Please wait a little while before trying again.",
    action: "retry",
  },
  offline: {
    title: "You're offline",
    body: "Check your internet connection and try again.",
    action: "retry",
  },
  "sign-in": {
    title: "Sign in to continue",
    body: "You need an account to do this.",
    action: "sign-in",
  },
  "verify-email": {
    title: "Verify your email to continue",
    body: "Confirm your email address to bookmark and comment on articles.",
    action: "verify-email",
  },
  unknown: {
    title: "Something went wrong",
    body: "Please try again.",
    action: "retry",
  },
};

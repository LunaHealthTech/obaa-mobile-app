// `next` is an absolute URL built from the server's own host, so it is never
// requested directly. Only its page number is used.
export function nextPageFromUrl(next: string | null | undefined): number | null {
  const match = next?.match(/[?&]page=(\d+)/);
  return match ? Number(match[1]) : null;
}

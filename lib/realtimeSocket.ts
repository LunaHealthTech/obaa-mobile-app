import { apiOrigin } from "@/lib/apiClient";

type Handlers = Record<string, (data: unknown) => void>;

const MAX_BACKOFF_MS = 30_000;

let openSocket: WebSocket | null = null;

function socketUrl(token: string) {
  return `${apiOrigin.replace(/^http/, "ws")}/ws/?token=${encodeURIComponent(token)}`;
}

export function sendRealtime(message: { source: string } & Record<string, unknown>) {
  if (openSocket?.readyState !== WebSocket.OPEN) return false;
  openSocket.send(JSON.stringify(message));
  return true;
}

// Reconnects with capped backoff until the returned disconnect is called.
// The token is read on every attempt, so a refreshed token doesn't need a
// new connection (dropping the socket would end any call in progress).
export function connectRealtime(
  getToken: () => string | null,
  handlers: Handlers,
  { onConnect, onClose }: { onConnect: () => void; onClose: () => void },
): () => void {
  let socket: WebSocket | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let attempt = 0;
  let stopped = false;

  const open = () => {
    socket = new WebSocket(socketUrl(getToken() ?? ""));
    socket.onopen = () => {
      attempt = 0;
      openSocket = socket;
      onConnect();
    };
    socket.onmessage = (event) => {
      let message: { source?: unknown; data?: unknown };
      try {
        message = JSON.parse(String(event.data));
      } catch {
        return;
      }
      const source = message?.source;
      if (typeof source === "string" && Object.hasOwn(handlers, source)) {
        handlers[source](message.data);
      }
    };
    socket.onclose = () => {
      if (openSocket === socket) openSocket = null;
      onClose();
      if (stopped) return;
      retryTimer = setTimeout(open, Math.min(MAX_BACKOFF_MS, 1000 * 2 ** attempt++));
    };
  };

  open();
  return () => {
    stopped = true;
    clearTimeout(retryTimer);
    socket?.close();
  };
}

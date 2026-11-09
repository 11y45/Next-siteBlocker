import type { Result } from "./types";

// The browser extension injects a tiny content script into this page. We talk to it with window.postMessage.
type Pending = { resolve: (r: Result<never>) => void; timer: ReturnType<typeof setTimeout> };
const pending = new Map<string, Pending>();
let bound = false;

function bind() {
  if (bound || typeof window === "undefined") return;
  bound = true;
  window.addEventListener("message", (e: MessageEvent) => {
    if (e.source !== window) return;
    const d = e.data;
    if (!d || d.source !== "sb-ext" || typeof d.id !== "string") return;
    const p = pending.get(d.id);
    if (!p) return;
    clearTimeout(p.timer);
    pending.delete(d.id);
    p.resolve(d.response);
  });
}

export function request<T = unknown>(type: string, payload?: unknown, timeoutMs = 2500): Promise<Result<T>> {
  bind();
  const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      resolve({ ok: false, error: "NO_EXTENSION", message: "Extension not detected." });
    }, timeoutMs);
    pending.set(id, { resolve: resolve as Pending["resolve"], timer });
    window.postMessage({ source: "sb-web", id, type, payload }, window.location.origin);
  });
}

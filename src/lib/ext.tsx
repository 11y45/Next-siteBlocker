"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { request } from "./bridge";
import type { ExtState, Result } from "./types";

type Status = "checking" | "connected" | "missing";
export type ToastKind = "success" | "error" | "info";
interface Toast { id: number; kind: ToastKind; text: string }

interface Ctx {
  status: Status;
  state: ExtState | null;
  refresh: () => Promise<void>;
  act: (type: string, payload?: unknown, opts?: { success?: string; silent?: boolean }) => Promise<Result>;
  toasts: Toast[];
  toast: (text: string, kind?: ToastKind) => void;
}

const ExtContext = createContext<Ctx | null>(null);

export function ExtProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("checking");
  const [state, setState] = useState<ExtState | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((text: string, kind: ToastKind = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  // Only the most recent refresh may update the UI, so a slow or timed-out older one can't undo a newer success.
  const seq = useRef(0);

  const refresh = useCallback(async () => {
    const mine = ++seq.current;
    const r = await request<ExtState>("getState");
    if (mine !== seq.current) return;
    if (r.ok) {
      setState(r.data);
      setStatus("connected");
    } else if (r.error === "NO_EXTENSION" || r.error === "BRIDGE") {
      setStatus("missing");
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000);
    const onVisible = () => { if (!document.hidden) refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", onVisible); };
  }, [refresh]);

  const act = useCallback<Ctx["act"]>(async (type, payload, opts) => {
    const r = await request<ExtState>(type, payload, 6000);
    // only ever adopt a real extension state (a stray reply must never replace it)
    if (r.data && "lock" in r.data) setState(r.data);
    if (r.ok) {
      setStatus("connected");
      if (opts?.success) toast(opts.success, "success");
    } else {
      if (r.error === "NO_EXTENSION") setStatus("missing");
      if (!opts?.silent) toast(r.message || r.error, "error");
    }
    return r;
  }, [toast]);

  const value = useMemo(() => ({ status, state, refresh, act, toasts, toast }), [status, state, refresh, act, toasts, toast]);
  return <ExtContext.Provider value={value}>{children}</ExtContext.Provider>;
}

export function useExt(): Ctx {
  const c = useContext(ExtContext);
  if (!c) throw new Error("useExt must be used inside <ExtProvider>");
  return c;
}

export function useNow(ms = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

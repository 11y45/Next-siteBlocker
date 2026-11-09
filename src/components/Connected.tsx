"use client";

import { useEffect, useState, type ReactNode } from "react";
import { PlugZap } from "lucide-react";
import { useExt } from "@/lib/ext";
import type { ExtState } from "@/lib/types";
import { Card } from "./ui";

export function NotConnected() {
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const { refresh } = useExt();
  return (
    <Card className="mx-auto mt-6 max-w-2xl">
      <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-lavender-50 text-lavender-500"><PlugZap /></div>
      <h2 className="text-xl font-bold">Connect the browser extension</h2>
      <p className="mt-1 text-sm text-muted">This dashboard controls your Website Blocker extension. Nothing is stored on a server — your data stays in your browser.</p>
      <ol className="mt-6 space-y-4 text-sm">
        {[
          <>Open <code className="rounded bg-fog-50 px-1.5 py-0.5">chrome://extensions</code>, enable <b>Developer mode</b>, click <b>Load unpacked</b> and pick the <code className="rounded bg-fog-50 px-1.5 py-0.5">site-blocker-extension</code> folder.</>,
          <>In the extension&apos;s <code className="rounded bg-fog-50 px-1.5 py-0.5">manifest.json</code>, set <code className="rounded bg-fog-50 px-1.5 py-0.5">content_scripts → matches</code> to this site: <code className="rounded bg-lavender-50 px-1.5 py-0.5 text-lavender-600">{origin || "your-site"}/*</code></>,
          <>Click the reload icon on the extension card, then reload this page.</>,
        ].map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lavender-100 text-xs font-bold text-lavender-600">{i + 1}</span>
            <span className="leading-6 text-ink/80">{step}</span>
          </li>
        ))}
      </ol>
      <button onClick={refresh} className="btn-primary mt-6">Check again</button>
    </Card>
  );
}

export function Connected({ children }: { children: (s: ExtState) => ReactNode }) {
  const { state, status } = useExt();
  if (!state) {
    return status === "checking"
      ? <div className="grid h-64 place-items-center text-sm text-muted">Connecting to the extension…</div>
      : <NotConnected />;
  }
  return <>{children(state)}</>;
}

"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CalendarClock, Layers, LockKeyhole, ShieldBan, Timer, Eye } from "lucide-react";
import { useExt } from "@/lib/ext";
import type { ExtState } from "@/lib/types";
import { ShieldLogo } from "./Logo";
import { Card } from "./ui";

const FEATURES = [
  { icon: ShieldBan, title: "Block distracting websites", text: "Add any site, or pick from popular ones. Blocked pages never load." },
  { icon: Layers, title: "Categories", text: "Block social media, news, shopping, gambling or adult sites in one click, with names hidden by default." },
  { icon: CalendarClock, title: "Schedules", text: "Block only on the days and hours you choose, like weekdays from 9:00 to 17:00." },
  { icon: Timer, title: "Focus timer", text: "Set focus time, break time and cycles, with pause and reset." },
  { icon: LockKeyhole, title: "Protection", text: "A passcode held by someone else plus a cooldown, or a time lock, so you can't give in on impulse." },
  { icon: Eye, title: "Private by design", text: "No account and no server. Your data stays inside your browser." },
];

/**
 * Shown when the extension isn't connected. It doubles as the home page's introduction for search engines and
 * new visitors, so it fades in after a short delay: people who already have the extension never see it flash.
 */
export function NotConnected({ checking = false }: { checking?: boolean }) {
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const { refresh } = useExt();
  return (
    <div className={checking ? "animate-fade-late" : ""}>
      <Card className="mx-auto max-w-3xl">
        <div className="flex items-center gap-4">
          <ShieldLogo size={52} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">siteBlocker</h1>
            <p className="text-sm text-muted">Block distracting websites. Schedule focus time.</p>
          </div>
        </div>
        <p className="mt-5 text-base leading-7 text-ink/80">
          siteBlocker is a browser extension with a clean dashboard. Choose the websites that pull you away, decide when they are blocked,
          run focus sessions, and lock your settings so a weak moment can&apos;t undo your plan.
        </p>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3 rounded-2xl bg-fog-50 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-lavender-100 text-lavender-600"><Icon size={17} /></span>
              <span className="text-sm"><b className="block text-ink">{title}</b><span className="text-muted">{text}</span></span>
            </li>
          ))}
        </ul>

        <h2 className="mt-8 text-xl font-bold">Connect the browser extension</h2>
        <p className="mt-1 text-sm text-muted">This dashboard controls your siteBlocker extension, in the same browser it is installed in.</p>
        <ol className="mt-5 space-y-4 text-sm">
          {[
            <>Open <code className="rounded bg-fog-50 px-1.5 py-0.5">chrome://extensions</code>, enable <b>Developer mode</b>, click <b>Load unpacked</b> and pick the <code className="rounded bg-fog-50 px-1.5 py-0.5">siteblocker-extension</code> folder.</>,
            <>In the extension&apos;s <code className="rounded bg-fog-50 px-1.5 py-0.5">manifest.json</code>, make sure <code className="rounded bg-fog-50 px-1.5 py-0.5">content_scripts → matches</code> lists this site: <code className="rounded bg-lavender-50 px-1.5 py-0.5 text-lavender-600">{origin || "https://siteblocker.vercel.app"}/*</code></>,
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
    </div>
  );
}

export function Connected({ children }: { children: (s: ExtState) => ReactNode }) {
  const { state, status } = useExt();
  if (!state) return <NotConnected checking={status === "checking"} />;
  return <>{children(state)}</>;
}

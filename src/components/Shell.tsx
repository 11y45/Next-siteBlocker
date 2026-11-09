"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard, Timer, ShieldBan, LayoutGrid, CalendarClock, Lock, Settings, Menu, X, Unlock, PlugZap,
} from "lucide-react";
import { ExtProvider, useExt, useNow } from "@/lib/ext";
import { mmss, sessionLeft } from "@/lib/format";
import { ShieldLogo } from "./Logo";
import { Toasts } from "./ui";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/focus", label: "Focus timer", icon: Timer },
  { href: "/blocklist", label: "Blocklist", icon: ShieldBan },
  { href: "/categories", label: "Categories", icon: LayoutGrid },
  { href: "/schedules", label: "Schedules", icon: CalendarClock },
  { href: "/protection", label: "Protection", icon: Lock },
  { href: "/settings", label: "Settings", icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  const { state, status } = useExt();
  const now = useNow();
  const s = state?.session;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-3 py-2">
        <ShieldLogo size={40} />
        <div>
          <p className="text-base font-bold leading-tight text-ink">Haven</p>
          <p className="text-xs text-muted">Focus &amp; blocking</p>
        </div>
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href} href={href} onClick={onNavigate}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                active ? "bg-lavender-50 text-lavender-600 shadow-inset" : "text-muted hover:bg-fog-50 hover:text-ink"
              }`}
            >
              <Icon size={18} /> {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 pt-6">
        {s && (
          <div className={`rounded-2xl p-4 ${s.phase === "focus" ? "bg-lavender-50 text-lavender-600" : "bg-mint-50 text-mint-600"}`}>
            <p className="text-xs font-semibold uppercase tracking-wide">{s.pausedAt ? "Paused" : s.phase === "focus" ? "Focusing" : "On a break"}</p>
            <p className="text-2xl font-bold tabular-nums">{mmss(sessionLeft(s, now))}</p>
            <p className="text-xs opacity-80">Cycle {s.cycle} of {s.cycles}</p>
          </div>
        )}
        <div className="flex items-center gap-3 rounded-2xl bg-fog-50 p-4 text-xs font-semibold text-muted">
          {status === "connected" ? <span className="h-2.5 w-2.5 rounded-full bg-mint-500" /> : <PlugZap size={14} />}
          <span className="flex-1">{status === "connected" ? "Extension connected" : status === "checking" ? "Connecting…" : "Extension not detected"}</span>
          {state && (state.locked ? <Lock size={14} className="text-lavender-500" /> : state.lock.type !== "none" ? <Unlock size={14} /> : null)}
        </div>
      </div>
    </div>
  );
}

function TitleTimer() {
  const { state } = useExt();
  const now = useNow();
  const s = state?.session;
  useEffect(() => {
    document.title = s ? `${mmss(sessionLeft(s, now))} · ${s.pausedAt ? "Paused" : s.phase === "focus" ? "Focus" : "Break"} — Haven` : "Haven — Focus & blocking";
  }, [s, now]);
  return null;
}

function Frame({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { state, status } = useExt();
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 p-4 lg:block">
        <div className="card h-full p-4"><SidebarContent /></div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between bg-canvas/80 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2 font-bold"><ShieldLogo size={30} /> Haven</div>
        <button aria-label="Menu" onClick={() => setOpen(true)} className="btn-ghost !p-2.5"><Menu size={20} /></button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 p-3">
            <div className="card relative h-full p-4">
              <button aria-label="Close" onClick={() => setOpen(false)} className="absolute right-3 top-3 btn-ghost !p-2"><X size={16} /></button>
              <SidebarContent onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <main className="px-4 pb-16 pt-6 lg:ml-72 lg:px-10 lg:pt-10">
        <div className="mx-auto max-w-6xl">
          {state && status === "missing" && (
            <div className="mb-6 rounded-2xl bg-peach-50 px-4 py-3 text-sm font-medium text-peach-600">
              Lost connection to the extension. If you just reloaded it, refresh this page.
            </div>
          )}
          {children}
        </div>
      </main>
      <Toasts />
      <TitleTimer />
    </div>
  );
}

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <ExtProvider>
      <Frame>{children}</Frame>
    </ExtProvider>
  );
}

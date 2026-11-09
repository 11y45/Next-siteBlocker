"use client";

import Link from "next/link";
import { Flame, ShieldCheck, Layers, Lock, ArrowRight, Play, Unlock } from "lucide-react";
import { Connected } from "@/components/Connected";
import { Card, PageHeader, StatCard, Pill, Avatar } from "@/components/ui";
import { TimerRing } from "@/components/TimerRing";
import { useExt, useNow } from "@/lib/ext";
import { CATEGORIES, CATEGORY_BY_ID } from "@/lib/catalog";
import { dayKey, greeting, humanDuration, lastDays, minutesLabel, mmss, sessionLeft, sessionProgress } from "@/lib/format";
import type { ExtState } from "@/lib/types";

function Overview({ s }: { s: ExtState }) {
  const { act } = useExt();
  const now = useNow();
  const today = s.stats.days[dayKey(now)] ?? { focusMin: 0, blocks: 0, sessions: 0 };
  const siteCount = Object.keys(s.sites).length;
  const week = lastDays(7, now).map((d) => ({ ...d, ...(s.stats.days[d.key] ?? { focusMin: 0, blocks: 0, sessions: 0 }) }));
  const maxFocus = Math.max(30, ...week.map((d) => d.focusMin));
  const top = Object.entries(s.stats.sites).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxTop = top[0]?.[1] ?? 1;

  const byCat = CATEGORIES.map((c) => ({ c, n: Object.values(s.sites).filter((x) => x === c.id).length })).filter((x) => x.n > 0);
  const session = s.session;

  const lockText =
    s.lock.type === "none" ? "Off"
    : s.lock.type === "time" ? "Time lock"
    : s.locked ? "Locked" : "Unlocked";

  return (
    <>
      <PageHeader title={`${greeting()}, welcome back`} subtitle="Here's how your focus and blocking are going today." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Focus today" value={minutesLabel(today.focusMin)} hint={`${today.sessions} session${today.sessions === 1 ? "" : "s"} completed`} icon={<Flame className="text-lavender-500" />} wash="bg-lavender-50" />
        <StatCard label="Blocks today" value={today.blocks} hint="Times you stayed on track" icon={<ShieldCheck className="text-mint-500" />} wash="bg-mint-50" />
        <StatCard label="Sites blocked" value={siteCount} hint={`${byCat.length} categor${byCat.length === 1 ? "y" : "ies"}`} icon={<Layers className="text-skyblue-500" />} wash="bg-skyblue-50" />
        <StatCard label="Protection" value={lockText} hint={s.lock.type === "none" ? "Anyone can edit the list" : "Weakening changes need unlocking"} icon={s.locked ? <Lock className="text-peach-500" /> : <Unlock className="text-peach-500" />} wash="bg-peach-50" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold">{session ? (session.phase === "focus" ? "Focus session" : "Break time") : "Ready to focus?"}</h2>
              <p className="text-sm text-muted">{session ? `Cycle ${session.cycle} of ${session.cycles}` : `${s.focusConfig.focusMin} min focus · ${s.focusConfig.breakMin} min break · ${s.focusConfig.cycles} cycles`}</p>
            </div>
            <Pill className={s.blockingActive ? "bg-mint-100 text-mint-600" : "bg-fog-100 text-fog-600"}>
              <span className={`h-2 w-2 rounded-full ${s.blockingActive ? "bg-mint-500" : "bg-fog-500"}`} />
              {s.blockingActive ? "Blocking on" : "Blocking off"}
            </Pill>
          </div>
          <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
            {session ? (
              <TimerRing
                size={220} tone={session.phase === "focus" ? "lav" : "mint"}
                progress={sessionProgress(session, now)}
                big={mmss(sessionLeft(session, now))} small={session.pausedAt ? "paused" : session.phase === "focus" ? "left to focus" : "left to rest"}
              />
            ) : (
              <TimerRing size={220} progress={0} big={`${s.focusConfig.focusMin}:00`} small="ready" />
            )}
            <div className="flex flex-col gap-3 sm:w-48">
              {!session && (
                <button className="btn-primary" onClick={() => act("startFocus", s.focusConfig, { success: "Focus session started" })}>
                  <Play size={16} /> Start session
                </button>
              )}
              <Link href="/focus" className="btn-soft">Timer settings <ArrowRight size={16} /></Link>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="text-lg font-bold">Last 7 days</h2>
          <p className="text-sm text-muted">Focus minutes per day</p>
          <div className="mt-6 flex h-44 items-end justify-between gap-2">
            {week.map((d) => (
              <div key={d.key} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-36 w-full items-end">
                  <div
                    title={`${d.focusMin} min`}
                    className={`w-full rounded-xl ${d.focusMin ? "bg-lavender-500" : "bg-fog-100"}`}
                    style={{ height: `${Math.max(6, (d.focusMin / maxFocus) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-muted">{d.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted">Total this week: <b className="text-ink">{humanDuration(week.reduce((a, d) => a + d.focusMin, 0) * 60000)}</b></p>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold">Most blocked sites</h2>
          <p className="mb-4 text-sm text-muted">Where the temptation shows up most.</p>
          {top.length === 0 ? (
            <p className="rounded-2xl bg-fog-50 p-4 text-sm text-muted">No blocked visits yet. Great start.</p>
          ) : (
            <ul className="space-y-3">
              {top.map(([domain, n]) => {
                const cat = CATEGORY_BY_ID[s.sites[domain] ?? "other"];
                const adult = s.sites[domain] === "adult";
                return (
                  <li key={domain} className="flex items-center gap-3">
                    {adult ? <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${cat.tone.chip}`}><cat.icon size={16} /></div> : <Avatar name={domain} className={cat.tone.chip} />}
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between text-sm"><span className="truncate font-semibold">{adult ? "Adult site" : domain}</span><span className="text-muted">{n}×</span></div>
                      <div className="mt-1.5 h-2 rounded-full bg-fog-50"><div className={`h-2 rounded-full ${cat.tone.solid}`} style={{ width: `${(n / maxTop) * 100}%` }} /></div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Your blocklist</h2>
              <p className="mb-4 text-sm text-muted">{siteCount} site{siteCount === 1 ? "" : "s"} across your categories.</p>
            </div>
            <Link href="/categories" className="btn-ghost !py-2">Browse</Link>
          </div>
          {byCat.length === 0 ? (
            <p className="rounded-2xl bg-fog-50 p-4 text-sm text-muted">Nothing blocked yet. Add sites from the Blocklist or Categories page.</p>
          ) : (
            <ul className="space-y-3">
              {byCat.map(({ c, n }) => (
                <li key={c.id} className="flex items-center gap-3">
                  <div className={`grid h-9 w-9 place-items-center rounded-xl ${c.tone.chip}`}><c.icon size={16} /></div>
                  <span className="flex-1 text-sm font-semibold">{c.label}</span>
                  <Pill className={c.tone.chip}>{n}</Pill>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

export default function Page() {
  return <Connected>{(s) => <Overview s={s} />}</Connected>;
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Clock, CalendarDays, Globe, Layers, Hourglass, ShieldBan, ArrowRight } from "lucide-react";
import { Connected } from "@/components/Connected";
import { Avatar, Card, EmptyState, PageHeader, Segmented, StatCard } from "@/components/ui";
import { request } from "@/lib/bridge";
import { useExt, useNow } from "@/lib/ext";
import { CATEGORY_BY_ID } from "@/lib/catalog";
import { RANGES, aggregate, dayKey, fmtDuration, hourLabel, percentChange, rangeKeys, type Aggregate, type Range, type UsageData } from "@/lib/usage";
import type { CategoryId, ExtState } from "@/lib/types";

const catLabel = (c: CategoryId) => (c === "other" ? "Other" : CATEGORY_BY_ID[c].label);
const parseKey = (key: string) => { const [y, m, d] = key.split("-").map(Number); return new Date(y, m - 1, d); };
const RANGE_NOUN: Record<Range, string> = { today: "today", yesterday: "yesterday", week: "in the last 7 days", month: "in the last 30 days" };
const VS: Record<Range, string> = { today: "yesterday", yesterday: "the day before", week: "the previous 7 days", month: "the previous 30 days" };

function BarChart({ range, agg, now }: { range: Range; agg: Aggregate; now: number }) {
  const hourly = range === "today" || range === "yesterday";
  const values = hourly ? agg.hours : agg.perDay.map((d) => d.ms);
  const max = Math.max(...values, 1);
  const currentHour = range === "today" ? new Date(now).getHours() : -1;
  const todayKey = dayKey(now);

  const label = (i: number): string => {
    if (hourly) return i % 6 === 0 ? hourLabel(i).replace(" ", "") : "";
    const d = parseKey(agg.perDay[i].key);
    if (range === "week") return d.toLocaleDateString("en", { weekday: "short" });
    return i === 0 || i % 5 === 4 ? String(d.getDate()) : "";
  };
  const tip = (i: number): string => {
    if (hourly) return `${hourLabel(i)} · ${fmtDuration(values[i])}`;
    return `${parseKey(agg.perDay[i].key).toLocaleDateString("en", { weekday: "short", day: "numeric", month: "short" })} · ${fmtDuration(values[i])}`;
  };

  return (
    <div>
      <div className="flex h-52 items-end gap-[3px] sm:gap-1.5" role="img" aria-label={hourly ? "Time spent by hour" : "Time spent by day"}>
        {values.map((ms, i) => {
          const align = i < values.length / 3 ? "left-0" : i > (values.length * 2) / 3 ? "right-0" : "left-1/2 -translate-x-1/2";
          return (
            <div key={i} className="group relative flex h-full min-w-0 flex-1 flex-col justify-end" title={tip(i)}>
              <span className={`pointer-events-none absolute z-10 whitespace-nowrap rounded-xl bg-ink px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lift transition group-hover:opacity-100 ${align}`}
                style={{ bottom: `calc(${ms > 0 ? Math.max(4, (ms / max) * 100) : 0}% + 10px)` }}>
                {tip(i)}
              </span>
              <div
                className={`w-full rounded-t-lg transition group-hover:bg-lavender-600 ${ms > 0 ? (i === currentHour || (!hourly && agg.perDay[i].key === todayKey) ? "bg-mint-500" : "bg-lavender-500") : "bg-fog-100"}`}
                style={{ height: ms > 0 ? `${Math.max(4, (ms / max) * 100)}%` : "3px" }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-[3px] sm:gap-1.5">
        {values.map((_, i) => (
          <span key={i} className="min-w-0 flex-1 whitespace-nowrap text-center text-[10px] font-medium text-muted">{label(i) || "\u00A0"}</span>
        ))}
      </div>
    </div>
  );
}

function Usage({ s }: { s: ExtState }) {
  const { act } = useExt();
  const now = useNow(30000);
  const [range, setRange] = useState<Range>("today");
  const [data, setData] = useState<UsageData | null>(null);
  const [failed, setFailed] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // live numbers: ask the extension every few seconds while this tab is visible
  useEffect(() => {
    let alive = true;
    const load = async () => {
      const r = await request<UsageData>("getUsage", { days: 61 }, 5000);
      if (!alive) return;
      if (r.ok) { setData(r.data); setFailed(false); } else setFailed(true);
    };
    load();
    const t = setInterval(() => { if (!document.hidden) load(); }, 8000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const cur = useMemo(() => aggregate(data, rangeKeys(range, now)), [data, range, now]);
  const prev = useMemo(() => aggregate(data, rangeKeys(range, now, 1)), [data, range, now]);
  const delta = percentChange(cur.total, prev.total);
  const days = cur.perDay.length;
  const hourly = range === "today" || range === "yesterday";

  const blockedSet = useMemo(() => new Set([...Object.keys(s.sites), ...s.scheduledDomains]), [s.sites, s.scheduledDomains]);
  const blockedMs = cur.sites.filter(([site]) => blockedSet.has(site)).reduce((a, [, ms]) => a + ms, 0);
  const catOf = (site: string): CategoryId => data?.categories[site] ?? "other";

  const topSite = cur.sites[0];
  const topCat = cur.categories[0];
  const peakHour = cur.hours.indexOf(Math.max(...cur.hours));
  const sitesShown = showAll ? cur.sites.slice(0, 30) : cur.sites.slice(0, 8);
  const maxSite = cur.sites[0]?.[1] ?? 1;

  return (
    <>
      <PageHeader
        title="Screen time"
        subtitle="See where your time goes. Time counts only while a tab is in front and you're active, or the tab is playing audio."
        action={<Segmented value={range} onChange={setRange} options={RANGES} />}
      />

      {!s.tracking && (
        <Card className="mb-6 flex flex-wrap items-center gap-4 !p-5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-fog-100 text-fog-500"><Hourglass /></div>
          <div className="min-w-[12rem] flex-1">
            <p className="font-bold">Time tracking is off</p>
            <p className="text-sm text-muted">Nothing new is being recorded. Turn it on to see how you spend your time.</p>
          </div>
          <button className="btn-primary" onClick={() => act("setTracking", { enabled: true }, { success: "Time tracking is on" })}>Turn on</button>
        </Card>
      )}

      {failed && !data && <Card><p className="py-6 text-center text-sm text-muted">Couldn&apos;t load your time data. Reload the page and try again.</p></Card>}
      {!data && !failed && <div className="grid h-48 place-items-center text-sm text-muted">Loading your time…</div>}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard
              label="Screen time" value={fmtDuration(cur.total)} icon={<Clock className="text-lavender-500" />} wash="bg-lavender-50"
              hint={delta === null ? `${RANGE_NOUN[range]}` : `${delta > 0 ? "▲" : delta < 0 ? "▼" : "="} ${Math.abs(delta)}% vs ${VS[range]}`}
            />
            {hourly ? (
              <StatCard label="Busiest hour" value={cur.total > 0 ? hourLabel(peakHour) : "—"} hint={cur.total > 0 ? fmtDuration(cur.hours[peakHour]) : "No data yet"} icon={<CalendarDays className="text-mint-500" />} wash="bg-mint-50" />
            ) : (
              <StatCard label="Daily average" value={fmtDuration(cur.total / days)} hint={`over ${days} days`} icon={<CalendarDays className="text-mint-500" />} wash="bg-mint-50" />
            )}
            <StatCard
              compact label="Top site" value={topSite ? (catOf(topSite[0]) === "adult" ? "Adult site" : topSite[0]) : "—"}
              hint={topSite ? fmtDuration(topSite[1]) : "No data yet"} icon={<Globe className="text-skyblue-500" />} wash="bg-skyblue-50"
            />
            <StatCard
              compact label="Top category" value={topCat ? catLabel(topCat[0]) : "—"}
              hint={topCat ? `${Math.round((topCat[1] / cur.total) * 100)}% of your time` : "No data yet"} icon={<Layers className="text-peach-500" />} wash="bg-peach-50"
            />
          </div>

          {cur.total === 0 ? (
            <Card className="mt-6">
              <EmptyState
                icon={<Hourglass />} title={`Nothing tracked ${RANGE_NOUN[range]}`}
                text={s.tracking ? "Time appears here as you browse. Pages are counted while they're in front of you." : "Time tracking is off, so nothing is being recorded."}
              />
            </Card>
          ) : (
            <>
              <Card className="mt-6">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold">{hourly ? "By hour" : "By day"}</h2>
                    <p className="text-sm text-muted">{hourly ? "When you were online" : `Time per day, ${RANGE_NOUN[range]}`}</p>
                  </div>
                  <p className="text-sm text-muted">Total <b className="text-ink">{fmtDuration(cur.total)}</b></p>
                </div>
                <BarChart range={range} agg={cur} now={now} />
              </Card>

              <div className="mt-6 grid gap-6 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold">Top sites</h2>
                    <span className="text-sm text-muted">{cur.sites.length} site{cur.sites.length === 1 ? "" : "s"}</span>
                  </div>
                  <ul className="space-y-4">
                    {sitesShown.map(([site, ms]) => {
                      const cat = CATEGORY_BY_ID[catOf(site)];
                      const adult = catOf(site) === "adult";
                      return (
                        <li key={site} className="flex items-center gap-3">
                          {adult
                            ? <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${cat.tone.chip}`}><cat.icon size={16} /></div>
                            : <Avatar name={site} className={cat.tone.chip} />}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3 text-sm">
                              <span className="flex min-w-0 items-center gap-1.5 font-semibold">
                                <span className="truncate">{adult ? "Adult site" : site}</span>
                                {blockedSet.has(site) && <ShieldBan size={13} className="shrink-0 text-lavender-500" aria-label="On your blocklist" />}
                              </span>
                              <span className="shrink-0 font-bold">{fmtDuration(ms)}</span>
                            </div>
                            <div className="mt-1.5 h-2 rounded-full bg-fog-50"><div className={`h-2 rounded-full ${cat.tone.solid}`} style={{ width: `${Math.max(3, (ms / maxSite) * 100)}%` }} /></div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  {cur.sites.length > 8 && (
                    <button className="btn-ghost mt-5 w-full" onClick={() => setShowAll((v) => !v)}>{showAll ? "Show fewer" : `Show more (${Math.min(30, cur.sites.length) - 8})`}</button>
                  )}
                </Card>

                <Card className="lg:col-span-2">
                  <h2 className="text-lg font-bold">Categories</h2>
                  <p className="mb-4 text-sm text-muted">Where your time goes, by type of site.</p>
                  <div className="flex h-3 overflow-hidden rounded-full bg-fog-50">
                    {cur.categories.map(([c, ms]) => <span key={c} className={CATEGORY_BY_ID[c].tone.solid} style={{ width: `${(ms / cur.total) * 100}%` }} title={`${catLabel(c)} · ${fmtDuration(ms)}`} />)}
                  </div>
                  <ul className="mt-5 space-y-3">
                    {cur.categories.map(([c, ms]) => (
                      <li key={c} className="flex items-center gap-3 text-sm">
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${CATEGORY_BY_ID[c].tone.solid}`} />
                        <span className="flex-1 truncate font-semibold">{catLabel(c)}</span>
                        <span className="text-muted">{Math.round((ms / cur.total) * 100)}%</span>
                        <span className="w-16 text-right font-bold">{fmtDuration(ms)}</span>
                      </li>
                    ))}
                  </ul>
                  {blockedMs > 0 && (
                    <p className="mt-5 rounded-2xl bg-lavender-50 p-4 text-sm text-lavender-600">
                      <b>{fmtDuration(blockedMs)}</b> on sites you block. That includes passes, and times when a schedule wasn&apos;t active.
                    </p>
                  )}
                </Card>
              </div>
            </>
          )}

          <Card className="mt-6 !p-5">
            <p className="text-sm text-muted">
              <b className="text-ink">How time is counted.</b> Only the tab in front, in the window you&apos;re using, while you&apos;re active or it&apos;s playing audio. Private (Incognito) windows and
              browser pages aren&apos;t tracked. Everything stays in your browser and is kept for 90 days.{" "}
              <Link href="/settings" className="inline-flex items-center gap-1 font-semibold text-lavender-600">Tracking settings <ArrowRight size={13} /></Link>
            </p>
          </Card>
        </>
      )}
    </>
  );
}

export default function Page() {
  return <Connected>{(s) => <Usage s={s} />}</Connected>;
}

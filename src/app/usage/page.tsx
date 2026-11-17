"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, CalendarDays, Globe, Layers, Hourglass, ShieldBan, ArrowRight, ChevronLeft, ChevronRight, X, Flame, Sun } from "lucide-react";
import { Connected } from "@/components/Connected";
import { Carousel } from "@/components/Carousel";
import { Avatar, Card, EmptyState, PageHeader, Segmented, StatCard } from "@/components/ui";
import { request } from "@/lib/bridge";
import { useExt, useNow } from "@/lib/ext";
import { CATEGORY_BY_ID } from "@/lib/catalog";
import {
  GRAINS, aggregate, bucketsFor, buildPeriods, dayKey, fmtDuration, hourLabel, parseKey, percentChange, recapFor,
  type Bucket, type Grain, type Period, type Recap, type UsageData,
} from "@/lib/usage";
import type { CategoryId, ExtState } from "@/lib/types";

const catLabel = (c: CategoryId) => CATEGORY_BY_ID[c]?.label ?? "Other";
const fmtDate = (key: string, o: Intl.DateTimeFormatOptions) => parseKey(key).toLocaleDateString("en", o);

/* ---------------------------------------------------------------- one page of the swipeable chart */

function PeriodChart({
  period, data, now, active, pickedIndex, onPick,
}: { period: Period; data: UsageData | null; now: number; active: boolean; pickedIndex: number | null; onPick: (i: number) => void }) {
  const buckets = useMemo(() => bucketsFor(period, data, now), [period, data, now]);
  const max = Math.max(...buckets.map((b) => b.ms), 1);
  const tappable = period.grain !== "day";

  return (
    <div className="px-0.5">
      <div className="flex h-52 items-end gap-[3px] sm:gap-1.5" role="group" aria-label={`Time spent, ${period.title}`}>
        {buckets.map((b, i) => {
          const pct = b.ms > 0 ? Math.max(4, (b.ms / max) * 100) : 0;
          const align = i < buckets.length / 3 ? "left-0" : i > (buckets.length * 2) / 3 ? "right-0" : "left-1/2 -translate-x-1/2";
          const picked = active && pickedIndex === i;
          const dim = active && pickedIndex !== null && !picked;
          const color = b.ms === 0 ? "bg-fog-100" : b.current ? "bg-mint-500" : "bg-lavender-500";
          const Tag = tappable ? "button" : "div";
          return (
            <Tag
              key={i} {...(tappable ? { type: "button" as const, onClick: () => onPick(i), "aria-pressed": picked, tabIndex: active ? 0 : -1 } : {})}
              title={`${b.tip} · ${fmtDuration(b.ms)}`}
              className={`group relative flex h-full min-w-0 flex-1 flex-col justify-end outline-none ${tappable ? "cursor-pointer" : ""}`}
            >
              <span
                className={`pointer-events-none absolute z-10 whitespace-nowrap rounded-xl bg-tooltip px-2.5 py-1.5 text-xs font-semibold text-tooltip-fg opacity-0 shadow-lift transition group-hover:opacity-100 ${align}`}
                style={{ bottom: `calc(${pct}% + 10px)` }}
              >
                {b.tip} · {fmtDuration(b.ms)}
              </span>
              <span
                className={`block w-full rounded-t-lg transition group-hover:brightness-110 ${color} ${dim ? "opacity-35" : ""} ${picked ? "ring-2 ring-lavender-200" : ""}`}
                style={{ height: b.ms > 0 ? `${pct}%` : "3px" }}
              />
            </Tag>
          );
        })}
      </div>
      <div className="mt-2 flex gap-[3px] sm:gap-1.5">
        {buckets.map((b, i) => (
          <span key={i} className="min-w-0 flex-1 whitespace-nowrap text-center text-[10px] font-medium text-muted">{b.label || "\u00A0"}</span>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- year in review */

const HEAT = ["bg-fog-100", "bg-lavender-500/25", "bg-lavender-500/50", "bg-lavender-500/75", "bg-lavender-500"];

function Heatmap({ recap, now, onPickDay, pickedKey, latest }: { recap: Recap; now: number; onPickDay: (key: string) => void; pickedKey: string | null; latest: boolean }) {
  const today = dayKey(now);
  const scroller = useRef<HTMLDivElement>(null);
  // on a narrow screen the year doesn't fit: open on the most recent weeks
  useEffect(() => { if (latest && scroller.current) scroller.current.scrollLeft = scroller.current.scrollWidth; }, [latest]);
  const max = Math.max(...recap.heat.map((d) => d.ms), 1);
  // columns are weeks (Mon to Sun); the first column is padded so each row is a weekday
  const lead = (parseKey(recap.heat[0].key).getDay() + 6) % 7;
  const cells: ({ key: string; ms: number } | null)[] = [...Array(lead).fill(null), ...recap.heat];
  const weeks: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const cols = { gridTemplateColumns: `repeat(${weeks.length}, minmax(12px, 1fr))` };

  return (
    <div ref={scroller} className="no-scrollbar overflow-x-auto pb-1">
      <div style={{ minWidth: weeks.length * 15 }}>
        <div className="mb-1.5 grid gap-[3px]" style={cols}>
          {weeks.map((w, i) => {
            const firstOfMonth = w.find((c) => c && parseKey(c.key).getDate() === 1); // label the week that contains the 1st
            return <span key={i} className="overflow-visible whitespace-nowrap text-[10px] font-medium text-muted">{firstOfMonth ? fmtDate(firstOfMonth.key, { month: "short" }) : ""}</span>;
          })}
        </div>
        <div className="grid gap-[3px]" style={cols} role="grid" aria-label="Time per day this year">
          {weeks.map((w, i) => (
            <div key={i} className="grid gap-[3px]" role="row">
              {w.map((c, j) => {
                if (!c) return <span key={j} className="aspect-square w-full" />;
                const future = c.key > today;
                const level = c.ms === 0 ? 0 : Math.min(4, Math.max(1, Math.ceil((c.ms / max) * 4)));
                return (
                  <button
                    key={j} type="button" disabled={future} onClick={() => onPickDay(c.key)}
                    title={`${fmtDate(c.key, { weekday: "short", day: "numeric", month: "short" })} · ${fmtDuration(c.ms)}`}
                    aria-label={`${fmtDate(c.key, { day: "numeric", month: "long" })}: ${fmtDuration(c.ms)}`}
                    className={`aspect-square w-full rounded-[3px] transition hover:brightness-125 ${future ? "border border-line bg-transparent" : HEAT[level]} ${c.key === today ? "ring-1 ring-mint-500" : ""} ${pickedKey === c.key ? "ring-2 ring-lavender-200" : ""}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-muted">
        Less {HEAT.map((c, i) => <span key={i} className={`h-3 w-3 rounded-[3px] ${c}`} />)} More
      </div>
    </div>
  );
}

function YearRecap({ period, data, now, onPickDay, pickedKey }: { period: Period; data: UsageData | null; now: number; onPickDay: (k: string) => void; pickedKey: string | null }) {
  const recap = useMemo(() => recapFor(period, data, now), [period, data, now]);
  if (recap.total === 0) return null;
  const facts: { icon: typeof Flame; label: string; value: string; hint: string }[] = [
    { icon: Clock, label: "Total", value: fmtDuration(recap.total), hint: `${recap.fullDays.toFixed(1)} full days online` },
    { icon: Sun, label: "On an active day", value: fmtDuration(recap.avgPerTrackedDay), hint: `${recap.daysTracked} days tracked` },
    ...(recap.busiestMonth ? [{ icon: CalendarDays, label: "Busiest month", value: recap.busiestMonth.label, hint: fmtDuration(recap.busiestMonth.ms) }] : []),
    ...(recap.busiestDay ? [{ icon: Flame, label: "Busiest day", value: fmtDate(recap.busiestDay.key, { day: "numeric", month: "short" }), hint: fmtDuration(recap.busiestDay.ms) }] : []),
  ];
  return (
    <Card className="mt-6">
      <div className="mb-1 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">{period.title} in review</h2>
          <p className="text-sm text-muted">Every day of the year. Darker means more time. Tap a day to see its details.</p>
        </div>
        {recap.longestStreak > 1 && <p className="text-sm text-muted">Longest streak <b className="text-ink">{recap.longestStreak} days</b></p>}
      </div>
      <div className="my-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {facts.map(({ icon: Icon, label, value, hint }) => (
          <div key={label} className="rounded-2xl bg-fog-50 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted"><Icon size={13} /> {label}</p>
            <p className="mt-1 truncate text-xl font-bold text-ink">{value}</p>
            <p className="text-xs text-muted">{hint}</p>
          </div>
        ))}
      </div>
      <Heatmap recap={recap} now={now} onPickDay={onPickDay} pickedKey={pickedKey} latest={period.isCurrent} />
    </Card>
  );
}

/* ---------------------------------------------------------------- the page */

interface Pick { keys: string[]; label: string; bucket?: number; day?: string }

function Usage({ s }: { s: ExtState }) {
  const { act } = useExt();
  const now = useNow(30000);
  const [grain, setGrain] = useState<Grain>("day");
  const [selectedId, setSelectedId] = useState<string | null>(null);   // null = the current period
  const [pick, setPick] = useState<Pick | null>(null);
  const [data, setData] = useState<UsageData | null>(null);
  const [failed, setFailed] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // everything once, then just today and yesterday every few seconds, merged in
  useEffect(() => {
    let alive = true;
    const merge = (r: UsageData, full: boolean) =>
      setData((prev) => (!prev || full ? r : { ...r, days: { ...prev.days, ...r.days }, categories: { ...prev.categories, ...r.categories }, since: r.since ?? prev.since }));
    const load = async (days: number, full: boolean) => {
      const r = await request<UsageData>("getUsage", { days }, 15000);
      if (!alive) return;
      if (r.ok) { merge(r.data, full); setFailed(false); } else setFailed(true);
    };
    load(1830, true);
    const t = setInterval(() => { if (!document.hidden) load(2, false); }, 8000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const minute = Math.floor(now / 60000);
  const periods = useMemo(() => buildPeriods(grain, now, data?.since ?? null), [grain, minute, data?.since]); // eslint-disable-line react-hooks/exhaustive-deps
  const found = selectedId ? periods.findIndex((p) => p.id === selectedId) : -1;
  const index = found >= 0 ? found : periods.length - 1;
  const period = periods[index];
  const prev = index > 0 ? periods[index - 1] : null;

  const go = (i: number) => { setSelectedId(periods[Math.min(periods.length - 1, Math.max(0, i))].id); setPick(null); };
  const changeGrain = (g: Grain) => { setGrain(g); setSelectedId(null); setPick(null); };

  const keys = pick ? pick.keys : period.keys;
  const cur = useMemo(() => aggregate(data, keys), [data, keys]);
  const prevAgg = useMemo(() => (prev ? aggregate(data, prev.keys) : null), [data, prev]);
  const singleDay = keys.length === 1;

  // compare like with like: a whole day against a whole day, otherwise average per day
  let delta: number | null = null;
  let vs = "";
  if (!pick && prevAgg) {
    if (grain === "day") { delta = percentChange(cur.total, prevAgg.total); vs = "the day before"; }
    else { delta = percentChange(cur.total / period.daysElapsed, prevAgg.total / prev!.daysElapsed); vs = `${prev!.sub.toLowerCase()} (per day)`; }
  }

  const blockedSet = useMemo(() => new Set([...Object.keys(s.sites), ...s.scheduledDomains]), [s.sites, s.scheduledDomains]);
  const blockedMs = cur.sites.filter(([site]) => blockedSet.has(site)).reduce((a, [, ms]) => a + ms, 0);
  const catOf = (site: string): CategoryId => data?.categories[site] ?? "other";
  const topSite = cur.sites[0];
  const topCat = cur.categories[0];
  const peakHour = cur.hours.indexOf(Math.max(...cur.hours));
  const sitesShown = showAll ? cur.sites.slice(0, 30) : cur.sites.slice(0, 8);
  const maxSite = cur.sites[0]?.[1] ?? 1;
  const noun = pick ? pick.label : period.sub.toLowerCase();

  const onPickBucket = (b: Bucket, i: number) =>
    setPick((p) => (p?.bucket === i ? null : { keys: b.keys, label: b.tip, bucket: i }));
  const onPickDay = (key: string) =>
    setPick((p) => (p?.day === key ? null : { keys: [key], label: fmtDate(key, { weekday: "short", day: "numeric", month: "short" }), day: key }));

  return (
    <>
      <PageHeader
        title="Screen time"
        subtitle="See where your time goes. Swipe the chart to move between days, weeks, months and years."
        action={<Segmented value={grain} onChange={changeGrain} options={GRAINS} />}
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
          <Card>
            <div className="mb-5 flex items-center gap-3">
              <button type="button" className="btn-ghost !p-2.5" aria-label={`Previous ${grain}`} disabled={index === 0} onClick={() => go(index - 1)}><ChevronLeft size={18} /></button>
              <div className="min-w-0 flex-1 text-center">
                <h2 className="truncate text-lg font-bold">{period.title}</h2>
                <p className="text-sm text-muted">
                  {period.sub}
                  {!period.isCurrent && <> · <button type="button" className="font-semibold text-lavender-600 hover:underline" onClick={() => go(periods.length - 1)}>Back to now</button></>}
                </p>
              </div>
              <button type="button" className="btn-ghost !p-2.5" aria-label={`Next ${grain}`} disabled={index === periods.length - 1} onClick={() => go(index + 1)}><ChevronRight size={18} /></button>
            </div>

            <Carousel
              key={grain} count={periods.length} index={index} onIndex={go} label={`${grain} charts`}
              renderPage={(i) => (
                <PeriodChart
                  period={periods[i]} data={data} now={now} active={i === index}
                  pickedIndex={i === index ? pick?.bucket ?? null : null}
                  onPick={(b) => { if (i === index) onPickBucket(bucketsFor(periods[i], data, now)[b], b); }}
                />
              )}
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
              <span>{pick ? <>Showing <b className="text-ink">{pick.label}</b> · {fmtDuration(cur.total)}</> : <>Total <b className="text-ink">{fmtDuration(cur.total)}</b></>}</span>
              {pick
                ? <button type="button" className="inline-flex items-center gap-1 font-semibold text-lavender-600" onClick={() => setPick(null)}><X size={14} /> Clear filter</button>
                : <span className="text-xs">{grain === "day" ? "Swipe, or use the arrows" : "Tap a bar to filter · swipe for other periods"}</span>}
            </div>
          </Card>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard
              compact={fmtDuration(cur.total).length > 7} label="Screen time" value={fmtDuration(cur.total)} icon={<Clock className="text-lavender-500" />} wash="bg-lavender-50"
              hint={delta === null ? noun : `${delta > 0 ? "▲" : delta < 0 ? "▼" : "="} ${Math.abs(delta)}% vs ${vs}`}
            />
            {singleDay ? (
              <StatCard label="Busiest hour" value={cur.total > 0 ? hourLabel(peakHour) : "—"} hint={cur.total > 0 ? fmtDuration(cur.hours[peakHour]) : "No data yet"} icon={<CalendarDays className="text-mint-500" />} wash="bg-mint-50" />
            ) : (
              <StatCard label="Daily average" value={fmtDuration(cur.total / (pick ? keys.length : period.daysElapsed))} hint={`over ${pick ? keys.length : period.daysElapsed} days`} icon={<CalendarDays className="text-mint-500" />} wash="bg-mint-50" />
            )}
            <StatCard compact label="Top site" value={topSite ? (catOf(topSite[0]) === "adult" ? "Adult site" : topSite[0]) : "—"} hint={topSite ? fmtDuration(topSite[1]) : "No data yet"} icon={<Globe className="text-skyblue-500" />} wash="bg-skyblue-50" />
            <StatCard compact label="Top category" value={topCat ? catLabel(topCat[0]) : "—"} hint={topCat ? `${Math.round((topCat[1] / cur.total) * 100)}% of your time` : "No data yet"} icon={<Layers className="text-peach-500" />} wash="bg-peach-50" />
          </div>

          {grain === "year" && <YearRecap period={period} data={data} now={now} onPickDay={onPickDay} pickedKey={pick?.day ?? null} />}

          {cur.total === 0 ? (
            <Card className="mt-6">
              <EmptyState
                icon={<Hourglass />} title={`Nothing tracked ${pick ? "for " : ""}${noun}`}
                text={s.tracking ? "Time appears here as you browse. Pages are counted while they're in front of you." : "Time tracking is off, so nothing is being recorded."}
              />
            </Card>
          ) : (
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
                      <span className="min-w-[4.5rem] whitespace-nowrap text-right font-bold">{fmtDuration(ms)}</span>
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
          )}

          <Card className="mt-6 !p-5">
            <p className="text-sm text-muted">
              <b className="text-ink">How time is counted.</b> Only the tab in front, in the window you&apos;re using, while you&apos;re active or it&apos;s playing audio. Private (Incognito) windows and
              browser pages aren&apos;t tracked. Everything stays in your browser and is kept until you clear it.{" "}
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

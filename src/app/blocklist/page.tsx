"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Trash2, Lock, ShieldBan, Eye, EyeOff, Sparkles } from "lucide-react";
import { Connected } from "@/components/Connected";
import { Avatar, Card, EmptyState, PageHeader } from "@/components/ui";
import { useExt } from "@/lib/ext";
import { CATALOG_BY_DOMAIN, CATEGORY_BY_ID, searchCatalog } from "@/lib/catalog";
import { normalizeDomain } from "@/lib/domain";
import { buildShortcuts } from "@/lib/shortcuts";
import type { ExtState } from "@/lib/types";

function Blocklist({ s }: { s: ExtState }) {
  const { act, toast } = useExt();
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("");
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const suggestions = useMemo(
    () => searchCatalog(input.split(/[\s,]+/).pop() ?? "").filter((x) => !s.sites[x.domain]),
    [input, s.sites],
  );
  const shortcuts = useMemo(() => buildShortcuts(s.sites, s.addCounts ?? {}), [s.sites, s.addCounts]);

  // Every add from this page is "by hand", which is what teaches the shortcuts what you block often.
  const add = async (raw: string[]) => {
    const sites = raw
      .map((t) => normalizeDomain(t))
      .filter((d): d is string => !!d)
      .map((domain) => ({ domain, category: CATALOG_BY_DOMAIN[domain]?.category ?? "other", manual: true }));
    if (!sites.length) return toast("That doesn't look like a website address.", "error");
    const r = await act("addSites", { sites }, { success: sites.length > 1 ? `${sites.length} sites added` : `${sites[0].domain} blocked` });
    if (r.ok) setInput("");
  };

  const rows = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return Object.keys(s.sites).filter((d) => !q || d.includes(q)).sort();
  }, [s.sites, filter]);

  const toggle = (d: string) =>
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d); else next.add(d);
      return next;
    });

  const total = Object.keys(s.sites).length;

  return (
    <>
      <PageHeader title="Blocklist" subtitle="Every site here is blocked, including its subdomains. Add several at once by separating them with spaces or commas." />

      <Card className="relative z-10">
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => { e.preventDefault(); add(input.split(/[\s,]+/).filter(Boolean)); }}
        >
          <div className="relative flex-1">
            <input
              className="input" placeholder="Site name or address"
              value={input} onChange={(e) => setInput(e.target.value)}
              onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 150)}
            />
            {focused && suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-lift">
                {suggestions.map((x) => {
                  const k = CATEGORY_BY_ID[x.category];
                  return (
                    <li key={x.domain}>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => add([x.domain])}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-fog-50">
                        <Avatar name={x.name} className={`!h-8 !w-8 ${k.tone.chip}`} />
                        <span className="flex-1"><span className="block text-sm font-semibold">{x.name}</span><span className="block text-xs text-muted">{x.domain}</span></span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <button className="btn-primary" disabled={!input.trim()}><Plus size={16} /> Block</button>
        </form>

        {shortcuts.length > 0 && (
          <div className="mt-6">
            <p className="label flex items-center gap-1.5"><Sparkles size={13} className="text-lavender-500" /> Quick block</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {shortcuts.map((x) => {
                const k = CATEGORY_BY_ID[x.category];
                return (
                  <button
                    key={x.domain} onClick={() => add([x.domain])} title={`Block ${x.domain}`}
                    className="group relative flex flex-col items-center gap-2.5 rounded-2xl bg-fog-50 px-3 py-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lift"
                  >
                    {x.personal && <span className="absolute right-2 top-2 rounded-full bg-lavender-100 px-2 py-0.5 text-[10px] font-bold text-lavender-600">Yours</span>}
                    <Avatar name={x.name} className={`!h-11 !w-11 !rounded-2xl !text-base ${k.tone.chip}`} />
                    <span className="text-sm font-semibold text-ink">{x.name}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-lavender-600 shadow-soft group-hover:bg-lavender-500 group-hover:text-white">
                      <Plus size={12} /> Block
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      <div className="mb-4 mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="whitespace-nowrap text-lg font-bold">Blocked sites <span className="text-muted">({total})</span></h2>
        {total > 0 && (
          <div className="relative w-full sm:w-56">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input !pl-9" placeholder="Search" value={filter} onChange={(e) => setFilter(e.target.value)} />
          </div>
        )}
      </div>

      {total === 0 ? (
        <Card><EmptyState icon={<ShieldBan />} title="Your blocklist is empty" text="Pick a quick block above, type a site, or head to Categories to block whole groups in one click." /></Card>
      ) : rows.length === 0 ? (
        <Card><p className="py-6 text-center text-sm text-muted">No sites match “{filter}”.</p></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((d) => {
            const cat = CATEGORY_BY_ID[s.sites[d] ?? "other"];
            const sensitive = s.sites[d] === "adult";
            const shown = !sensitive || revealed.has(d);
            return (
              <div key={d} className="card flex min-w-0 items-center gap-3 !rounded-2xl px-4 py-3">
                {shown
                  ? <Avatar name={d} className={`!h-10 !w-10 !rounded-xl ${cat.tone.chip}`} />
                  : <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${cat.tone.chip}`}><cat.icon size={17} /></div>}
                <span className={`min-w-0 flex-1 truncate text-sm font-semibold ${shown ? "" : "text-muted"}`}>{shown ? d : "Adult site"}</span>
                {sensitive && (
                  <button aria-label={shown ? "Hide name" : "Show name"} title={shown ? "Hide name" : "Show name"} onClick={() => toggle(d)}
                    className="rounded-xl p-2 text-muted transition hover:bg-fog-50 hover:text-ink">
                    {shown ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
                <button
                  aria-label={`Unblock ${shown ? d : "site"}`}
                  title={s.locked ? "Protection is on — unlock first" : "Unblock"}
                  onClick={() => act("removeSites", { domains: [d] }, { success: "Unblocked" })}
                  className={`rounded-xl p-2 transition ${s.locked ? "text-muted/60 hover:bg-fog-50" : "text-muted hover:bg-blush-50 hover:text-blush-600"}`}
                >
                  {s.locked ? <Lock size={16} /> : <Trash2 size={16} />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default function Page() {
  return <Connected>{(s) => <Blocklist s={s} />}</Connected>;
}

"use client";

import { useMemo, useState } from "react";
import { X, Plus, Check, Globe, LayoutGrid, Clock, CalendarDays, Moon } from "lucide-react";
import { Avatar, Toggle } from "./ui";
import { useExt } from "@/lib/ext";
import { CATALOG, CATALOG_BY_DOMAIN, CATEGORIES, CATEGORY_BY_ID, searchCatalog } from "@/lib/catalog";
import { normalizeDomain } from "@/lib/domain";
import { buildShortcuts } from "@/lib/shortcuts";
import { DAY_CAPS, DAY_ORDER, EVERY_DAY, WEEKDAYS, WEEKEND, daysSummary, hoursSummary, isAdultDomain, isOvernight } from "@/lib/schedule";
import type { CategoryId, Rule } from "@/lib/types";

type Tab = "sites" | "categories";

/**
 * Create or edit a scheduled rule. Mount it to open it, unmount it to close it:
 * its form state starts fresh from `initial` every time.
 */
export function RuleEditor({ initial, onClose }: { initial: Partial<Rule>; onClose: () => void }) {
  const { act, toast, state } = useExt();
  const editing = !!initial.id;

  const [name, setName] = useState(initial.name ?? "");
  const [tab, setTab] = useState<Tab>(initial.categories?.length && !initial.sites?.length ? "categories" : "sites");
  const [sites, setSites] = useState<string[]>(initial.sites ?? []);
  const [cats, setCats] = useState<CategoryId[]>(initial.categories ?? []);
  const [allDay, setAllDay] = useState(initial.allDay ?? false);
  const [start, setStart] = useState(initial.start ?? "09:00");
  const [end, setEnd] = useState(initial.end ?? "17:00");
  const [days, setDays] = useState<number[]>(initial.days ?? WEEKDAYS);
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [busy, setBusy] = useState(false);

  const known = state?.sites ?? {};
  const suggestions = useMemo(
    () => searchCatalog(input.split(/[\s,]+/).pop() ?? "").filter((x) => !sites.includes(x.domain)),
    [input, sites],
  );
  const quick = useMemo(
    () => buildShortcuts(Object.fromEntries(sites.map((d) => [d, "other" as CategoryId])), state?.addCounts ?? {}, 6),
    [sites, state?.addCounts],
  );

  const addSites = (raw: string[]) => {
    const valid = raw.map((t) => normalizeDomain(t)).filter((d): d is string => !!d);
    if (!valid.length) return toast("That doesn't look like a website address.", "error");
    setSites((prev) => [...new Set([...prev, ...valid])]);
    setInput("");
  };

  const toggleCat = (id: CategoryId) => setCats((p) => (p.includes(id) ? p.filter((c) => c !== id) : [...p, id]));
  const toggleDay = (d: number) => setDays((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));

  const targets = sites.length + cats.length;
  const problem =
    !targets ? "Pick at least one website or category."
    : !days.length ? "Pick at least one day."
    : !allDay && start === end ? "Start and end time must be different."
    : "";

  const save = async () => {
    if (problem) return toast(problem, "error");
    setBusy(true);
    const rule = {
      ...(editing ? { id: initial.id } : {}),
      name: name.trim() || (cats.length === 1 && !sites.length ? `${CATEGORY_BY_ID[cats[0]].label} hours` : "New rule"),
      enabled: initial.enabled ?? true,
      sites, categories: cats, allDay, start, end, days,
    };
    const r = await act("rule/save", { rule }, { success: editing ? "Rule updated" : "Rule created" });
    setBusy(false);
    if (r.ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
      <div className="card relative flex max-h-[94vh] w-full max-w-2xl flex-col !rounded-b-none shadow-lift sm:!rounded-3xl">
        <div className="flex items-center gap-3 border-b border-line px-4 py-4 sm:px-6">
          <button className="btn-ghost !px-3 !py-2" onClick={onClose} aria-label="Close"><X size={16} /></button>
          <h2 className="flex-1 text-lg font-bold">{editing ? "Edit rule" : "New rule"}</h2>
        </div>

        <div className="space-y-7 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          <div>
            <label className="label" htmlFor="rule-name">Rule name</label>
            <input id="rule-name" className="input" placeholder="e.g. Work hours" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
          </div>

          {/* What to block */}
          <div>
            <p className="label">What to block</p>
            <div className="rounded-3xl bg-fog-50 p-3 sm:p-4">
              <div className="mb-4 grid grid-cols-2 gap-1 rounded-2xl bg-white p-1 shadow-soft">
                {([["sites", "Websites", Globe], ["categories", "Categories", LayoutGrid]] as const).map(([id, label, Icon]) => (
                  <button key={id} type="button" onClick={() => setTab(id)}
                    className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${tab === id ? "bg-lavender-50 text-lavender-600" : "text-muted hover:text-ink"}`}>
                    <Icon size={15} /> {label}
                    {id === "sites" && sites.length > 0 && <span className="rounded-full bg-lavender-500 px-1.5 text-[11px] text-white">{sites.length}</span>}
                    {id === "categories" && cats.length > 0 && <span className="rounded-full bg-lavender-500 px-1.5 text-[11px] text-white">{cats.length}</span>}
                  </button>
                ))}
              </div>

              {tab === "sites" ? (
                <div className="space-y-4">
                  <form className="relative" onSubmit={(e) => { e.preventDefault(); addSites(input.split(/[\s,]+/).filter(Boolean)); }}>
                    <input className="input !bg-white" placeholder="Search a website or paste an address" value={input}
                      onChange={(e) => setInput(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 150)} />
                    {focused && suggestions.length > 0 && (
                      <ul className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-lift">
                        {suggestions.map((x) => (
                          <li key={x.domain}>
                            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => addSites([x.domain])}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-fog-50">
                              <Avatar name={x.name} className={`!h-8 !w-8 ${CATEGORY_BY_ID[x.category].tone.chip}`} />
                              <span className="flex-1"><span className="block text-sm font-semibold">{x.name}</span><span className="block text-xs text-muted">{x.domain}</span></span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </form>

                  {quick.length > 0 && (
                    <div>
                      <p className="mb-2 text-center text-xs font-medium text-muted">Suggested</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {quick.map((x) => (
                          <button key={x.domain} type="button" onClick={() => addSites([x.domain])}
                            className="inline-flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3 text-sm font-semibold shadow-soft transition hover:-translate-y-0.5">
                            <Avatar name={x.name} className={`!h-7 !w-7 !rounded-full !text-xs ${CATEGORY_BY_ID[x.category].tone.chip}`} /> {x.name}
                            <Plus size={14} className="text-lavender-500" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {sites.length > 0 && (
                    <div className="flex flex-wrap gap-2 border-t border-line pt-4">
                      {sites.map((d) => (
                        <span key={d} className="inline-flex items-center gap-1.5 rounded-full bg-lavender-50 py-1.5 pl-3.5 pr-2 text-sm font-semibold text-lavender-600">
                          {isAdultDomain(d, known) ? "Adult site" : d}
                          <button type="button" aria-label="Remove" onClick={() => setSites((p) => p.filter((x) => x !== d))} className="rounded-full p-0.5 hover:bg-lavender-100"><X size={14} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {CATEGORIES.filter((c) => c.id !== "other").map((c) => {
                    const on = cats.includes(c.id);
                    const n = CATALOG.filter((x) => x.category === c.id).length;
                    return (
                      <button key={c.id} type="button" onClick={() => toggleCat(c.id)}
                        className={`flex items-center gap-3 rounded-2xl p-3 text-left transition ${on ? `bg-white ring-2 ${c.tone.ring} shadow-soft` : "bg-white/70 hover:bg-white"}`}>
                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${c.tone.chip}`}><c.icon size={18} /></span>
                        <span className="min-w-0 flex-1"><span className="block text-sm font-bold">{c.label}</span><span className="block text-xs text-muted">{n} sites</span></span>
                        {on && <span className="grid h-6 w-6 place-items-center rounded-full bg-lavender-500 text-white"><Check size={13} /></span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Hours */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="label !mb-0 flex items-center gap-1.5"><Clock size={13} /> Blocking hours</p>
              <label className="flex items-center gap-3 text-sm font-semibold">All day <Toggle checked={allDay} onChange={setAllDay} label="All day" /></label>
            </div>
            <div className={`grid gap-3 rounded-3xl bg-fog-50 p-3 sm:grid-cols-2 sm:p-4 ${allDay ? "opacity-50" : ""}`}>
              <div><label className="label" htmlFor="rule-start">Starts at</label><input id="rule-start" type="time" className="input !bg-white" value={start} disabled={allDay} onChange={(e) => setStart(e.target.value)} /></div>
              <div><label className="label" htmlFor="rule-end">Ends at</label><input id="rule-end" type="time" className="input !bg-white" value={end} disabled={allDay} onChange={(e) => setEnd(e.target.value)} /></div>
              {isOvernight({ allDay, start, end }) && (
                <p className="flex items-center gap-2 text-xs font-medium text-lavender-600 sm:col-span-2"><Moon size={14} /> Runs overnight and ends the next morning.</p>
              )}
            </div>
          </div>

          {/* Days */}
          <div>
            <p className="label flex items-center gap-1.5"><CalendarDays size={13} /> Blocking days</p>
            <div className="rounded-3xl bg-fog-50 p-3 sm:p-4">
              <div className="mb-4 flex justify-center gap-1.5 sm:gap-2">
                {DAY_ORDER.map((d) => {
                  const on = days.includes(d);
                  return (
                    <button key={d} type="button" aria-pressed={on} onClick={() => toggleDay(d)}
                      className={`grid h-10 w-10 place-items-center rounded-full text-[10px] font-bold transition sm:h-12 sm:w-12 sm:text-[11px] ${on ? "bg-lavender-500 text-white shadow-soft" : "bg-white text-muted hover:text-ink"}`}>
                      {DAY_CAPS[d]}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {([["Weekdays", WEEKDAYS], ["Weekends", WEEKEND], ["Every day", EVERY_DAY]] as const).map(([label, set]) => (
                  <button key={label} type="button" onClick={() => setDays([...set])}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${daysSummary(days) === label ? "bg-lavender-100 text-lavender-600" : "bg-white text-muted hover:text-ink"}`}>{label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-4 sm:px-6">
          <p className="text-xs font-medium text-muted">
            {targets ? <>Blocks <b className="text-ink">{[sites.length && `${sites.length} site${sites.length > 1 ? "s" : ""}`, cats.length && `${cats.length} categor${cats.length > 1 ? "ies" : "y"}`].filter(Boolean).join(" + ")}</b> · {hoursSummary({ allDay, start, end })} · {daysSummary(days) || "no days"}</> : "Nothing selected yet"}
          </p>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={busy}>Save rule</button>
          </div>
        </div>
      </div>
    </div>
  );
}

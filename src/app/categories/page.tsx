"use client";

import { useState } from "react";
import { Check, Plus, Lock, Eye, EyeOff, CalendarClock } from "lucide-react";
import { Connected } from "@/components/Connected";
import { Card, PageHeader } from "@/components/ui";
import { RuleEditor } from "@/components/RuleEditor";
import { useExt } from "@/lib/ext";
import { CATALOG, CATEGORIES } from "@/lib/catalog";
import type { CategoryId, ExtState, Rule } from "@/lib/types";

function Categories({ s }: { s: ExtState }) {
  const { act } = useExt();
  const [shown, setShown] = useState<Partial<Record<CategoryId, boolean>>>({}); // names are hidden by default
  const [editor, setEditor] = useState<Partial<Rule> | null>(null);

  return (
    <>
      <PageHeader title="Categories" subtitle="Block a whole group in one click. Site names stay hidden — tap the eye on a category if you want to pick sites one by one." />

      <div className="grid gap-6 xl:grid-cols-2">
        {CATEGORIES.filter((c) => c.id !== "other").map((c) => {
          const sites = CATALOG.filter((x) => x.category === c.id);
          const blocked = sites.filter((x) => s.sites[x.domain]);
          const all = blocked.length === sites.length;
          const visible = !!shown[c.id];
          return (
            <Card key={c.id} className="!p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${c.tone.chip}`}><c.icon size={22} /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold">{c.label}</p>
                  <p className="truncate text-xs text-muted">{c.blurb}</p>
                </div>
                <button
                  aria-label={`Schedule ${c.label}`} title="Block only at certain hours or days"
                  onClick={() => setEditor({ name: `${c.label} hours`, categories: [c.id] })}
                  className="rounded-xl bg-fog-50 p-2.5 text-muted transition hover:bg-lavender-50 hover:text-lavender-600"
                >
                  <CalendarClock size={17} />
                </button>
                <button
                  aria-label={visible ? `Hide ${c.label} sites` : `Show ${c.label} sites`}
                  title={visible ? "Hide site names" : "Show site names"}
                  onClick={() => setShown((p) => ({ ...p, [c.id]: !p[c.id] }))}
                  className="rounded-xl bg-fog-50 p-2.5 text-muted transition hover:bg-fog-100 hover:text-ink"
                >
                  {visible ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
                {all ? (
                  <button
                    className="btn-ghost !py-2" title={s.locked ? "Protection is on — unlock first" : undefined}
                    onClick={() => act("removeSites", { domains: blocked.map((x) => x.domain) }, { success: `${c.label} unblocked` })}
                  >
                    {s.locked && <Lock size={14} />} Unblock all
                  </button>
                ) : (
                  <button
                    className="btn-primary !py-2"
                    onClick={() => act("addSites", { sites: sites.map((x) => ({ domain: x.domain, category: c.id })) }, { success: `${c.label} blocked` })}
                  >
                    Block all
                  </button>
                )}
              </div>

              <div className="mb-3 h-2 rounded-full bg-fog-50">
                <div className={`h-2 rounded-full ${c.tone.solid} transition-all`} style={{ width: `${(blocked.length / sites.length) * 100}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs font-medium text-muted">
                <span>{blocked.length} of {sites.length} blocked</span>
                {!visible && <span>Names hidden</span>}
              </div>

              {visible && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {sites.map((x) => {
                    const on = !!s.sites[x.domain];
                    return (
                      <button
                        key={x.domain} title={x.domain}
                        onClick={() => on
                          ? act("removeSites", { domains: [x.domain] }, { success: `${x.name} unblocked` })
                          : act("addSites", { sites: [{ domain: x.domain, category: c.id }] }, { success: `${x.name} blocked` })}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                          on ? `${c.tone.chip} ring-2 ${c.tone.ring}` : "bg-fog-50 text-muted hover:bg-fog-100 hover:text-ink"
                        }`}
                      >
                        {on ? <Check size={14} /> : <Plus size={14} />} {x.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
      {editor && <RuleEditor key={`cat-${editor.categories?.[0]}`} initial={editor} onClose={() => setEditor(null)} />}
    </>
  );
}

export default function Page() {
  return <Connected>{(s) => <Categories s={s} />}</Connected>;
}

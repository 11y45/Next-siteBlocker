"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarClock, Clock, Pencil, Plus, Trash2, Lock, ShieldBan, Globe, ArrowRight } from "lucide-react";
import { Connected } from "@/components/Connected";
import { RuleEditor } from "@/components/RuleEditor";
import { Card, ConfirmDialog, EmptyState, PageHeader, Pill, Toggle } from "@/components/ui";
import { useExt } from "@/lib/ext";
import { CATEGORY_BY_ID } from "@/lib/catalog";
import { daysSummary, hoursSummary } from "@/lib/schedule";
import type { ExtState, Rule } from "@/lib/types";

function Schedules({ s }: { s: ExtState }) {
  const { act, toast } = useExt();
  const [editor, setEditor] = useState<Partial<Rule> | null>(null);
  const [deleting, setDeleting] = useState<Rule | null>(null);

  const locked = () => {
    if (s.locked) toast("Protection is on. Unlock it first to change or remove rules.", "error");
    return s.locked;
  };
  const siteCount = Object.keys(s.sites).length;

  return (
    <>
      <PageHeader
        title="Schedules"
        subtitle="Block sites or whole categories only at certain hours and on certain days — like work hours, study time or late nights."
        action={<button className="btn-primary" onClick={() => setEditor({})}><Plus size={16} /> New rule</button>}
      />

      <Card className="mb-6 flex flex-wrap items-center gap-4 !p-5">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-mint-50 text-mint-500"><ShieldBan /></div>
        <div className="min-w-0 flex-1">
          <p className="font-bold">Your blocklist</p>
          <p className="text-sm text-muted">
            {siteCount} site{siteCount === 1 ? "" : "s"} · {s.settings.blockWhen === "always" ? "blocked all day, every day" : "blocked during focus sessions"}. Rules below add extra blocking on a schedule.
          </p>
        </div>
        <Link href="/blocklist" className="btn-ghost">Manage <ArrowRight size={15} /></Link>
      </Card>

      {s.rules.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CalendarClock />} title="No schedules yet"
            text="Create a rule to block a few sites or a whole category only when you need to focus — for example weekdays from 9:00 to 17:00."
            action={<button className="btn-primary" onClick={() => setEditor({})}><Plus size={16} /> Create your first rule</button>}
          />
        </Card>
      ) : (
        <div className="grid gap-4">
          {s.rules.map((r) => {
            const status = !r.enabled ? "off" : r.active ? "active" : "waiting";
            return (
              <Card key={r.id} className={`!p-5 ${r.enabled ? "" : "opacity-70"}`}>
                <div className="flex flex-wrap items-center gap-4">
                  <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${status === "active" ? "bg-mint-100 text-mint-600" : status === "waiting" ? "bg-lavender-100 text-lavender-600" : "bg-fog-100 text-fog-500"}`}>
                    <CalendarClock size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-base font-bold">{r.name}</p>
                      <Pill className={status === "active" ? "bg-mint-100 text-mint-600" : status === "waiting" ? "bg-lavender-100 text-lavender-600" : "bg-fog-100 text-fog-600"}>
                        <span className={`h-2 w-2 rounded-full ${status === "active" ? "bg-mint-500" : status === "waiting" ? "bg-lavender-500" : "bg-fog-500"}`} />
                        {status === "active" ? "Blocking now" : status === "waiting" ? "Scheduled" : "Off"}
                      </Pill>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                      <span className="inline-flex items-center gap-1.5"><Clock size={14} /> {hoursSummary(r)}</span>
                      <span className="inline-flex items-center gap-1.5"><CalendarClock size={14} /> {daysSummary(r.days)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Toggle checked={r.enabled} label={`Turn ${r.enabled ? "off" : "on"} ${r.name}`}
                      onChange={(v) => { if (!v && locked()) return; act("rule/toggle", { id: r.id, enabled: v }); }} />
                    <button aria-label="Edit rule" title="Edit" className="ml-2 rounded-xl p-2.5 text-muted transition hover:bg-fog-50 hover:text-ink"
                      onClick={() => { if (!locked()) setEditor(r); }}>
                      {s.locked ? <Lock size={16} /> : <Pencil size={16} />}
                    </button>
                    <button aria-label="Delete rule" title="Delete" className="rounded-xl p-2.5 text-muted transition hover:bg-blush-50 hover:text-blush-600"
                      onClick={() => { if (!locked()) setDeleting(r); }}>
                      {s.locked ? <Lock size={16} /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {r.categories.map((c) => {
                    const cat = CATEGORY_BY_ID[c];
                    return <span key={c} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${cat.tone.chip}`}><cat.icon size={13} /> {cat.label}</span>;
                  })}
                  {r.sites.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-fog-50 px-3 py-1.5 text-xs font-semibold text-fog-600"><Globe size={13} /> {r.sites.length} website{r.sites.length === 1 ? "" : "s"}</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {editor && <RuleEditor key={editor.id ?? "new"} initial={editor} onClose={() => setEditor(null)} />}

      <ConfirmDialog
        open={!!deleting} icon={Trash2} title="Delete this rule?"
        text={deleting ? `“${deleting.name}” will stop blocking on its schedule.` : ""}
        confirmLabel="Delete rule" cancelLabel="Keep rule"
        onCancel={() => setDeleting(null)}
        onConfirm={() => { const r = deleting; setDeleting(null); if (r) act("rule/delete", { id: r.id }, { success: "Rule deleted" }); }}
      />
    </>
  );
}

export default function Page() {
  return <Connected>{(s) => <Schedules s={s} />}</Connected>;
}

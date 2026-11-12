"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Upload, Lock, Radio, Clock, PlugZap, Hourglass, Trash2 } from "lucide-react";
import { Connected } from "@/components/Connected";
import { Card, ConfirmDialog, PageHeader, Toggle } from "@/components/ui";
import { request } from "@/lib/bridge";
import { useExt } from "@/lib/ext";
import type { CategoryId, ExtState } from "@/lib/types";

function Settings({ s }: { s: ExtState }) {
  const { act, toast } = useExt();
  const file = useRef<HTMLInputElement>(null);
  const [since, setSince] = useState<number | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    request<{ since: number | null }>("getUsage", { days: 1 }).then((r) => { if (r.ok) setSince(r.data.since); });
  }, [s.tracking]);

  const modes = [
    { value: "always" as const, title: "Always on", text: "Blocked sites stay blocked all day, every day.", icon: Radio },
    { value: "focus-only" as const, title: "Only during focus", text: "Blocking turns on when a focus session starts and off during breaks.", icon: Clock },
  ];

  const exportList = () => {
    const blob = new Blob([JSON.stringify({ sites: s.sites }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "siteblocker-blocklist.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importList = async (f: File) => {
    try {
      const data = JSON.parse(await f.text());
      const entries: [string, CategoryId][] = Array.isArray(data)
        ? data.map((d: string) => [d, "other"])
        : Object.entries((data.sites ?? data) as Record<string, CategoryId>);
      await act("addSites", { sites: entries.map(([domain, category]) => ({ domain, category })) }, { success: "Blocklist imported" });
    } catch {
      toast("That file isn't a valid blocklist.", "error");
    }
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Blocking behaviour, your data and the extension connection." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <h2 className="mb-1 text-lg font-bold">When should sites be blocked?</h2>
          <p className="mb-5 text-sm text-muted">{s.locked ? "Protection is on, so you can only switch toward “Always on”." : "You can change this any time while protection is off."}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {modes.map((m) => {
              const on = s.settings.blockWhen === m.value;
              return (
                <button
                  key={m.value} onClick={() => !on && act("setSettings", { blockWhen: m.value }, { success: "Setting saved" })}
                  className={`flex items-start gap-4 rounded-2xl p-5 text-left transition ${on ? "bg-lavender-50 ring-2 ring-lavender-200" : "bg-fog-50 hover:bg-fog-100"}`}
                >
                  <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${on ? "bg-lavender-500 text-white" : "bg-white text-muted"}`}><m.icon size={18} /></div>
                  <div className="flex-1"><p className="flex items-center gap-2 font-bold">{m.title}{!on && s.locked && m.value === "focus-only" && <Lock size={13} className="text-muted" />}</p><p className="text-sm text-muted">{m.text}</p></div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-start gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-lavender-50 text-lavender-500"><Hourglass /></div>
            <div className="min-w-[12rem] flex-1">
              <h2 className="text-lg font-bold">Time tracking</h2>
              <p className="mt-1 text-sm text-muted">
                Records how long you spend on each website so you can see it on the Screen time page. It counts the tab in front while you&apos;re active or it plays audio.
                Private windows aren&apos;t tracked, nothing leaves your browser, and data older than 90 days is deleted.
              </p>
              {since && <p className="mt-2 text-xs font-medium text-muted">Tracking since {new Date(since).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })}</p>}
            </div>
            <Toggle checked={s.tracking} label="Track time on websites" onChange={(v) => act("setTracking", { enabled: v }, { success: v ? "Time tracking is on" : "Time tracking is off" })} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3 border-t border-line pt-5">
            <button className="btn-danger" onClick={() => setConfirmClear(true)}><Trash2 size={16} /> Clear tracked time</button>
          </div>
        </Card>

        <Card>
          <h2 className="mb-1 text-lg font-bold">Your data</h2>
          <p className="mb-5 text-sm text-muted">Everything lives inside your browser&apos;s extension storage. Back it up or move it to another browser. Importing only adds sites.</p>
          <div className="flex flex-wrap gap-3">
            <button className="btn-soft" onClick={exportList}><Download size={16} /> Export blocklist</button>
            <button className="btn-ghost" onClick={() => file.current?.click()}><Upload size={16} /> Import</button>
            <input ref={file} type="file" accept="application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importList(f); e.target.value = ""; }} />
          </div>
        </Card>

        <Card>
          <h2 className="mb-1 flex items-center gap-2 text-lg font-bold"><PlugZap size={18} className="text-mint-500" /> Extension</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Status</dt><dd className="font-semibold text-mint-600">Connected</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Version</dt><dd className="font-semibold">{s.version}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted">Linked dashboard</dt><dd className="truncate font-semibold">{s.dashboardUrl ?? "—"}</dd></div>
          </dl>
          <p className="mt-5 rounded-2xl bg-fog-50 p-4 text-xs text-muted">
            Tip: to block in Incognito, open <code>chrome://extensions</code> → siteBlocker → Details → <b>Allow in Incognito</b>.
          </p>
        </Card>
      </div>
      <ConfirmDialog
        open={confirmClear} icon={Trash2} title="Clear all tracked time?"
        text="Your screen time history will be deleted from this browser. This can't be undone."
        confirmLabel="Clear tracked time" cancelLabel="Keep my data"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => { setConfirmClear(false); act("clearUsage", undefined, { success: "Tracked time cleared" }); setSince(null); }}
      />
    </>
  );
}

export default function Page() {
  return <Connected>{(s) => <Settings s={s} />}</Connected>;
}

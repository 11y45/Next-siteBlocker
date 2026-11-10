"use client";

import { useRef } from "react";
import { Download, Upload, Lock, Radio, Clock, PlugZap } from "lucide-react";
import { Connected } from "@/components/Connected";
import { Card, PageHeader } from "@/components/ui";
import { useExt } from "@/lib/ext";
import type { CategoryId, ExtState } from "@/lib/types";

function Settings({ s }: { s: ExtState }) {
  const { act, toast } = useExt();
  const file = useRef<HTMLInputElement>(null);

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
    </>
  );
}

export default function Page() {
  return <Connected>{(s) => <Settings s={s} />}</Connected>;
}

"use client";

import { useState } from "react";
import { Play, RotateCcw, Coffee, Brain, Repeat, Lock, Pause } from "lucide-react";
import { Connected } from "@/components/Connected";
import { Card, ConfirmDialog, PageHeader, Stepper, Pill } from "@/components/ui";
import { TimerRing } from "@/components/TimerRing";
import { useExt, useNow } from "@/lib/ext";
import { humanDuration, mmss, sessionLeft, sessionProgress } from "@/lib/format";
import type { ExtState, FocusConfig } from "@/lib/types";

const PRESETS: { name: string; cfg: FocusConfig }[] = [
  { name: "Classic 25/5", cfg: { focusMin: 25, breakMin: 5, cycles: 4 } },
  { name: "Deep work 50/10", cfg: { focusMin: 50, breakMin: 10, cycles: 3 } },
  { name: "Flow 90/20", cfg: { focusMin: 90, breakMin: 20, cycles: 2 } },
  { name: "Quick 15/3", cfg: { focusMin: 15, breakMin: 3, cycles: 4 } },
];

function Focus({ s }: { s: ExtState }) {
  const { act } = useExt();
  const now = useNow();
  const [cfg, setCfg] = useState<FocusConfig>(s.focusConfig);
  const [ask, setAsk] = useState<"pause" | "reset" | null>(null);
  const session = s.session;
  const paused = !!session?.pausedAt;
  const total = cfg.focusMin * cfg.cycles + cfg.breakMin * (cfg.cycles - 1);

  const save = (next: FocusConfig) => {
    setCfg(next);
    act("setFocusConfig", next, { silent: true });
  };

  // When protection is on the extension would refuse anyway, so skip the dialog and show its message.
  const askReset = () => (s.locked ? act("stopFocus") : setAsk("reset"));
  const askPause = () => (s.locked ? act("pauseFocus") : setAsk("pause"));

  return (
    <>
      <PageHeader title="Focus timer" subtitle="Work in focused sprints with breaks in between. Your blocklist is enforced during focus time." />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="flex flex-col items-center justify-center gap-6 py-10 lg:col-span-3">
          {session ? (
            <>
              <Pill className={paused ? "bg-fog-100 text-fog-600" : session.phase === "focus" ? "bg-lavender-100 text-lavender-600" : "bg-mint-100 text-mint-600"}>
                {paused ? <Pause size={14} /> : session.phase === "focus" ? <Brain size={14} /> : <Coffee size={14} />}
                {paused ? "Paused" : session.phase === "focus" ? "Focus" : "Break"}
              </Pill>
              <TimerRing
                tone={session.phase === "focus" ? "lav" : "mint"}
                progress={sessionProgress(session, now)}
                big={mmss(sessionLeft(session, now))}
                small={`Cycle ${session.cycle} of ${session.cycles}`}
              />
              <div className="flex gap-2">
                {Array.from({ length: session.cycles }, (_, i) => (
                  <span key={i} className={`h-2.5 w-8 rounded-full ${i + 1 < session.cycle ? "bg-lavender-500" : i + 1 === session.cycle ? "bg-lavender-200" : "bg-fog-100"}`} />
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {paused ? (
                  <button className="btn-primary" onClick={() => act("resumeFocus")}><Play size={16} /> Resume</button>
                ) : (
                  <button className="btn-soft" onClick={askPause} title={s.locked ? "Protection is on — unlock first" : undefined}>
                    {s.locked ? <Lock size={16} /> : <Pause size={16} />} Pause
                  </button>
                )}
                <button className="btn-danger" onClick={askReset} title={s.locked ? "Protection is on — unlock first" : undefined}>
                  {s.locked ? <Lock size={16} /> : <RotateCcw size={16} />} Reset session
                </button>
              </div>
              {s.locked && <p className="max-w-xs text-center text-xs text-muted">Protection is active, so this session can&apos;t be ended early. It will finish on its own.</p>}
            </>
          ) : (
            <>
              <TimerRing progress={0} big={`${cfg.focusMin}:00`} small={`${cfg.cycles} cycle${cfg.cycles > 1 ? "s" : ""} · ${humanDuration(total * 60000)} total`} />
              <button className="btn-primary px-8 py-3 text-base" onClick={() => act("startFocus", cfg, { success: "Focus session started" })}>
                <Play size={18} /> Start focusing
              </button>
            </>
          )}
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h2 className="mb-5 text-lg font-bold">Session setup</h2>
            <div className="space-y-6">
              <Stepper label="Focus time" unit="min" min={5} max={120} step={5} value={cfg.focusMin} disabled={!!session} onChange={(n) => save({ ...cfg, focusMin: n })} />
              <Stepper label="Break time" unit="min" min={1} max={30} value={cfg.breakMin} disabled={!!session} onChange={(n) => save({ ...cfg, breakMin: n })} />
              <Stepper label="Cycles" unit={cfg.cycles === 1 ? "round" : "rounds"} min={1} max={10} value={cfg.cycles} disabled={!!session} onChange={(n) => save({ ...cfg, cycles: n })} />
            </div>
            {session && <p className="mt-5 text-xs text-muted">Settings are locked while a session is running.</p>}
          </Card>

          <Card>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Repeat size={18} className="text-lavender-500" /> Presets</h2>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name} disabled={!!session} onClick={() => save(p.cfg)}
                  className="rounded-2xl bg-fog-50 px-3 py-3 text-left text-sm font-semibold text-ink transition hover:bg-lavender-50 hover:text-lavender-600 disabled:opacity-50"
                >
                  {p.name}
                  <span className="block text-xs font-medium text-muted">{p.cfg.cycles} rounds</span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted">
              Blocking mode: <b className="text-ink">{s.settings.blockWhen === "always" ? "always on" : "only during focus"}</b>. Change it in Settings.
            </p>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={ask === "pause"} icon={Pause} tone="soft" title="Pause your session?"
        text="Your timer will freeze until you press Resume. Stay with it if you can."
        confirmLabel="Pause session" cancelLabel="Back to session"
        onCancel={() => setAsk(null)}
        onConfirm={() => { setAsk(null); act("pauseFocus", undefined, { success: "Session paused" }); }}
      />
      <ConfirmDialog
        open={ask === "reset"} icon={RotateCcw} title="Reset this session?"
        text="Your progress will be lost and the timer goes back to the start."
        confirmLabel="Stop session" cancelLabel="Back to session"
        onCancel={() => setAsk(null)}
        onConfirm={() => { setAsk(null); act("stopFocus", undefined, { success: "Session reset" }); }}
      />
    </>
  );
}

export default function Page() {
  return <Connected>{(s) => <Focus s={s} />}</Connected>;
}

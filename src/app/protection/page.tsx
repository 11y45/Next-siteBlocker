"use client";

import { useState } from "react";
import {
  ShieldCheck, Lock, Unlock, Hourglass, KeyRound, CalendarClock, Copy, RefreshCw, Users, Check,
} from "lucide-react";
import { Connected } from "@/components/Connected";
import { Card, PageHeader, Pill, Segmented } from "@/components/ui";
import { useExt, useNow } from "@/lib/ext";
import { generatePasscode } from "@/lib/passcode";
import { humanDuration, mmss } from "@/lib/format";
import type { ExtState } from "@/lib/types";

const RULES = [
  ["Adding is always allowed", "Block more sites or start a session whenever you like."],
  ["Weakening is refused", "Unblocking sites, stopping a session early, or switching to “focus only” are all refused while locked."],
  ["Enforced in the extension", "The rules live inside the extension, so editing this page can't bypass them."],
];

function HowItWorks() {
  return (
    <Card>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><ShieldCheck className="text-mint-500" size={20} /> How protection works</h2>
      <ul className="space-y-4">
        {RULES.map(([t, d]) => (
          <li key={t} className="flex gap-3">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-mint-100 text-mint-600"><Check size={14} /></span>
            <span className="text-sm"><b className="block text-ink">{t}</b><span className="text-muted">{d}</span></span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Check2({ checked, onChange, children }: { checked: boolean; onChange: (b: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-fog-50 p-4 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#7C6CF0]" />
      <span className="text-ink/80">{children}</span>
    </label>
  );
}

/* ---------------- setup ---------------- */

function PasscodeSetup({ onBack }: { onBack: () => void }) {
  const { act, toast } = useExt();
  const [cooldown, setCooldown] = useState(30);
  const [how, setHow] = useState<"generate" | "friend">("generate");
  const [code, setCode] = useState("");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const value = how === "generate" ? code : a;
  const valid = how === "generate" ? !!code && sent : a.length >= 8 && a === b && sent;

  const activate = async () => {
    setBusy(true);
    const r = await act("lock/setupPasscode", { passcode: value, cooldownMin: cooldown }, { success: "Protection is on" });
    setBusy(false);
    if (r.ok) { setCode(""); setA(""); setB(""); setSent(false); onBack(); }
  };

  return (
    <Card>
      <button className="mb-4 text-sm font-semibold text-lavender-600" onClick={onBack}>← Back</button>
      <h2 className="text-xl font-bold">Passcode + cooldown</h2>
      <p className="mb-6 mt-1 text-sm text-muted">Unlocking needs a waiting period <i>and</i> a passcode that someone else holds.</p>

      <p className="label">1 · Cooldown before you can enter the passcode</p>
      <Segmented value={cooldown} onChange={setCooldown} options={[
        { value: 10, label: "10 min" }, { value: 30, label: "30 min" }, { value: 60, label: "1 hour" }, { value: 120, label: "2 hours" },
      ]} />
      <p className="mt-2 text-xs text-muted">Urges usually fade within 15–30 minutes. A longer wait protects you more.</p>

      <p className="label mt-7">2 · Who holds the passcode?</p>
      <Segmented value={how} onChange={(v) => { setHow(v); setSent(false); }} options={[
        { value: "generate", label: "Random code — I'll send it away" },
        { value: "friend", label: "A trusted person types it" },
      ]} />

      {how === "generate" ? (
        <div className="mt-4 space-y-4">
          {!code ? (
            <button className="btn-soft" onClick={() => setCode(generatePasscode())}><KeyRound size={16} /> Generate a random code</button>
          ) : (
            <div className="rounded-2xl bg-lavender-50 p-5">
              <p className="select-all break-all text-center font-mono text-2xl font-bold tracking-wider text-lavender-600">{code}</p>
              <div className="mt-3 flex justify-center gap-2">
                <button className="btn-ghost !py-2" onClick={() => { navigator.clipboard?.writeText(code); toast("Code copied — send it now.", "info"); }}><Copy size={14} /> Copy</button>
                <button className="btn-ghost !py-2" onClick={() => { setCode(generatePasscode()); setSent(false); }}><RefreshCw size={14} /> New code</button>
              </div>
              <p className="mt-3 text-center text-xs text-lavender-600/80">This is the only time you&apos;ll see it. It is never stored — only a one-way hash.</p>
            </div>
          )}
          {code && <Check2 checked={sent} onChange={setSent}>I&apos;ve sent this code to someone I trust and I won&apos;t keep a copy. I understand it can&apos;t be recovered.</Check2>}
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <p className="rounded-2xl bg-fog-50 p-4 text-sm text-muted">
            Hand your device to a friend, partner or mentor and ask them to type a passcode only <b>they</b> will know (at least 8 characters).
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="password" autoComplete="new-password" className="input" placeholder="Passcode (8+ characters)" value={a} onChange={(e) => setA(e.target.value)} />
            <input type="password" autoComplete="new-password" className="input" placeholder="Repeat passcode" value={b} onChange={(e) => setB(e.target.value)} />
          </div>
          {a && b && a !== b && <p className="text-xs font-medium text-blush-600">The two passcodes don&apos;t match.</p>}
          <Check2 checked={sent} onChange={setSent}>I don&apos;t know this passcode, and the person who typed it will keep it.</Check2>
        </div>
      )}

      <button className="btn-primary mt-6" disabled={!valid || busy} onClick={activate}><Lock size={16} /> Turn on protection</button>
    </Card>
  );
}

function TimeSetup({ onBack, extend }: { onBack?: () => void; extend?: boolean }) {
  const { act } = useExt();
  const [days, setDays] = useState(7);
  const [ok, setOk] = useState(false);
  return (
    <Card>
      {onBack && <button className="mb-4 text-sm font-semibold text-lavender-600" onClick={onBack}>← Back</button>}
      <h2 className="text-xl font-bold">{extend ? "Extend your time lock" : "Time lock"}</h2>
      <p className="mb-6 mt-1 text-sm text-muted">
        {extend ? "You can make the lock longer, never shorter." : "Commit for a fixed period. There is no unlock button — nothing can undo it before the date."}
      </p>
      <p className="label">{extend ? "New length from today" : "Lock for"}</p>
      <Segmented value={days} onChange={setDays} options={[1, 3, 7, 14, 30, 60].map((d) => ({ value: d, label: d === 1 ? "1 day" : `${d} days` }))} />
      <div className="mt-5"><Check2 checked={ok} onChange={setOk}>I understand I won&apos;t be able to unblock sites or stop sessions until the lock ends.</Check2></div>
      <button className="btn-primary mt-6" disabled={!ok} onClick={async () => { const r = await act("lock/setupTime", { days }, { success: extend ? "Time lock extended" : "Time lock is on" }); if (r.ok) { setOk(false); onBack?.(); } }}>
        <CalendarClock size={16} /> {extend ? "Extend lock" : "Start time lock"}
      </button>
    </Card>
  );
}

function ChooseMethod({ onPick }: { onPick: (m: "passcode" | "time") => void }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <button onClick={() => onPick("passcode")} className="card group p-6 text-left transition hover:-translate-y-0.5 hover:shadow-lift">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-lavender-50 text-lavender-500"><KeyRound /></div>
        <Pill className="mb-3 bg-mint-100 text-mint-600">Recommended</Pill>
        <h3 className="text-lg font-bold">Passcode + cooldown</h3>
        <p className="mt-1 text-sm text-muted">A passcode you don&apos;t know, held by someone you trust, plus a waiting period before it can even be entered. Handles real emergencies, defeats impulses.</p>
      </button>
      <button onClick={() => onPick("time")} className="card group p-6 text-left transition hover:-translate-y-0.5 hover:shadow-lift">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-peach-50 text-peach-500"><CalendarClock /></div>
        <Pill className="mb-3 bg-peach-100 text-peach-600">Strictest</Pill>
        <h3 className="text-lg font-bold">Time lock</h3>
        <p className="mt-1 text-sm text-muted">Lock your settings for 1–60 days. No passcode and no override — it simply ends on the date. Best for challenges and tough stretches.</p>
      </button>
    </div>
  );
}

/* ---------------- active states ---------------- */

function TimeLocked({ s }: { s: ExtState }) {
  const now = useNow();
  const [extend, setExtend] = useState(false);
  const { until = 0, createdAt = now } = s.lock;
  return (
    <>
      <Card className="bg-gradient-to-br from-lavender-50 to-white">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-lavender-100 text-lavender-600"><Lock /></div>
          <div className="flex-1"><p className="text-lg font-bold">Time lock is active</p><p className="text-sm text-muted">Ends {new Date(until).toLocaleString()}</p></div>
          <Pill className="bg-lavender-100 text-lavender-600"><Hourglass size={14} /> {humanDuration(until - now)} left</Pill>
        </div>
        <div className="mt-6 h-2.5 rounded-full bg-lavender-100"><div className="h-2.5 rounded-full bg-lavender-500" style={{ width: `${Math.min(100, ((now - createdAt) / (until - createdAt)) * 100)}%` }} /></div>
      </Card>
      {extend ? <TimeSetup extend onBack={() => setExtend(false)} /> : <button className="btn-soft self-start" onClick={() => setExtend(true)}><CalendarClock size={16} /> Extend lock</button>}
    </>
  );
}

function PasscodeLocked({ s }: { s: ExtState }) {
  const { act, toast } = useExt();
  const now = useNow();
  const l = s.lock;
  const [code, setCode] = useState("");
  const lockedOut = !!l.lockoutUntil && now < l.lockoutUntil;
  const requestLive = !!l.unlockRequestedAt && !(l.requestExpiresAt && now > l.requestExpiresAt);
  const ready = requestLive && !!l.readyAt && now >= l.readyAt;

  if (!l.locked) {
    return (
      <Card className="bg-gradient-to-br from-mint-50 to-white">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-mint-100 text-mint-600"><Unlock /></div>
          <div className="flex-1"><p className="text-lg font-bold">Temporarily unlocked</p><p className="text-sm text-muted">Re-locks automatically in <b className="tabular-nums text-ink">{mmss((l.unlockedUntil ?? now) - now)}</b></p></div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="btn-primary" onClick={() => act("lock/relock", undefined, { success: "Locked again" })}><Lock size={16} /> Lock now</button>
          <button className="btn-danger" onClick={() => { if (confirm("Turn protection off completely?")) act("lock/disable", undefined, { success: "Protection turned off" }); }}>Turn protection off</button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-lavender-50 to-white">
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-lavender-100 text-lavender-600"><Lock /></div>
        <div className="flex-1"><p className="text-lg font-bold">Protection is on</p><p className="text-sm text-muted">Passcode lock · {l.cooldownMin} min cooldown</p></div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-soft">
        {lockedOut ? (
          <div className="text-sm"><b className="text-blush-600">Too many wrong attempts.</b> Try again in <b className="tabular-nums">{mmss(l.lockoutUntil! - now)}</b>.</div>
        ) : !requestLive ? (
          <>
            <p className="font-semibold">Need to make a change?</p>
            <p className="mb-4 mt-1 text-sm text-muted">Start the {l.cooldownMin}-minute cooldown. After it ends you&apos;ll have an hour to enter the passcode.</p>
            <button className="btn-soft" onClick={() => act("lock/requestUnlock", undefined, { success: "Cooldown started" })}><Hourglass size={16} /> Request unlock</button>
          </>
        ) : !ready ? (
          <>
            <p className="font-semibold">Cooling off…</p>
            <p className="my-2 text-4xl font-bold tabular-nums text-lavender-600">{mmss(l.readyAt! - now)}</p>
            <p className="mb-4 text-sm text-muted">Take a walk, drink some water. If the urge passes, you can cancel.</p>
            <button className="btn-ghost" onClick={() => act("lock/cancelUnlock", undefined, { success: "Request cancelled" })}>Cancel request</button>
          </>
        ) : (
          <form onSubmit={async (e) => {
            e.preventDefault();
            const r = await act("lock/unlock", { passcode: code }, { success: "Unlocked for 10 minutes" });
            if (r.ok) setCode(""); else if (!r.ok && r.failsLeft) toast(`${r.failsLeft} attempt${r.failsLeft === 1 ? "" : "s"} left`, "info");
          }}>
            <p className="font-semibold">Enter the passcode</p>
            <p className="mb-3 mt-1 text-sm text-muted">Ask the person who holds it. Valid for {humanDuration((l.requestExpiresAt ?? now) - now)} more.</p>
            <div className="flex gap-3">
              <input autoFocus type="password" autoComplete="off" className="input" placeholder="Passcode" value={code} onChange={(e) => setCode(e.target.value)} />
              <button className="btn-primary" disabled={!code}><Unlock size={16} /> Unlock</button>
            </div>
          </form>
        )}
      </div>
    </Card>
  );
}

function Protection({ s }: { s: ExtState }) {
  const [mode, setMode] = useState<"passcode" | "time" | null>(null);
  const none = s.lock.type === "none";

  return (
    <>
      <PageHeader
        title="Protection"
        subtitle="For the moments when willpower isn't enough. Protection makes it hard to weaken your own rules on impulse."
        action={<Pill className={s.lock.type === "none" ? "bg-fog-100 text-fog-600" : s.locked ? "bg-lavender-100 text-lavender-600" : "bg-mint-100 text-mint-600"}>{s.lock.type === "none" ? "Off" : s.locked ? "Locked" : "Unlocked"}</Pill>}
      />
      <div className="flex flex-col gap-6">
        {none && mode === null && <ChooseMethod onPick={setMode} />}
        {none && mode === "passcode" && <PasscodeSetup onBack={() => setMode(null)} />}
        {none && mode === "time" && <TimeSetup onBack={() => setMode(null)} />}
        {s.lock.type === "time" && <TimeLocked s={s} />}
        {s.lock.type === "passcode" && <PasscodeLocked s={s} />}
        <HowItWorks />
        <Card className="flex items-start gap-4 bg-lavender-50/60">
          <Users className="mt-0.5 shrink-0 text-lavender-500" />
          <p className="text-sm text-ink/80"><b>Tip:</b> choose the method while you feel calm and strong. The best passcode is one you simply don&apos;t have.</p>
        </Card>
      </div>
    </>
  );
}

export default function Page() {
  return <Connected>{(s) => <Protection s={s} />}</Connected>;
}

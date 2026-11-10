"use client";

import { type ReactNode } from "react";
import { Check, X, Info, type LucideIcon } from "lucide-react";
import { useExt } from "@/lib/ext";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card p-6 ${className}`}>{children}</div>;
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Pill({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}

export function StatCard({ label, value, hint, icon, wash }: { label: string; value: ReactNode; hint?: string; icon: ReactNode; wash: string }) {
  return (
    <div className="card flex min-w-0 flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl sm:h-12 sm:w-12 ${wash}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
        <p className="truncate text-2xl font-bold text-ink">{value}</p>
        {hint && <p className="truncate text-xs text-muted">{hint}</p>}
      </div>
    </div>
  );
}

export function Avatar({ name, className = "" }: { name: string; className?: string }) {
  return (
    <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-bold uppercase ${className}`}>
      {name.charAt(0)}
    </div>
  );
}

export function Segmented<T extends string | number>({
  value, onChange, options, disabled,
}: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; disabled?: boolean }) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-2xl bg-fog-50 p-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          disabled={disabled}
          onClick={() => onChange(o.value)}
          className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition disabled:opacity-50 ${
            o.value === value ? "bg-white text-lavender-600 shadow-soft" : "text-muted hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Stepper({
  label, value, min, max, step = 1, unit, onChange, disabled,
}: { label: string; value: number; min: number; max: number; step?: number; unit: string; onChange: (n: number) => void; disabled?: boolean }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="label !mb-0">{label}</span>
        <span className="text-sm font-bold text-ink">{value} <span className="font-medium text-muted">{unit}</span></span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value} disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-lavender-100 disabled:opacity-50"
      />
    </div>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-lavender-50 text-lavender-500">{icon}</div>
      <h3 className="text-base font-bold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Toasts() {
  const { toasts } = useExt();
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-[min(92vw,360px)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-2xl p-4 text-sm font-medium shadow-lift ${
            t.kind === "error" ? "bg-blush-50 text-blush-600" : t.kind === "success" ? "bg-mint-50 text-mint-600" : "bg-white text-ink"
          }`}
        >
          <span className="mt-0.5">{t.kind === "error" ? <X size={16} /> : t.kind === "success" ? <Check size={16} /> : <Info size={16} />}</span>
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}

export function ConfirmDialog({
  open, icon: Icon, tone = "danger", title, text, confirmLabel, cancelLabel = "Back to session", onConfirm, onCancel,
}: {
  open: boolean; icon: LucideIcon; tone?: "danger" | "soft"; title: string; text: string;
  confirmLabel: string; cancelLabel?: string; onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="card relative w-full max-w-sm p-7 text-center shadow-lift">
        <div className={`mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl ${tone === "danger" ? "bg-blush-100 text-blush-600" : "bg-lavender-100 text-lavender-600"}`}>
          <Icon size={24} />
        </div>
        <h3 className="text-lg font-bold text-ink">{title}</h3>
        <p className="mt-1.5 text-sm text-muted">{text}</p>
        <div className="mt-6 flex flex-col gap-2">
          <button className={tone === "danger" ? "btn-danger" : "btn-soft"} onClick={onConfirm}>{confirmLabel}</button>
          <button className="btn-primary" autoFocus onClick={onCancel}>{cancelLabel}</button>
        </div>
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-50 ${checked ? "bg-lavender-500" : "bg-fog-100"}`}
    >
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-soft transition-all ${checked ? "left-6" : "left-1"}`} />
    </button>
  );
}

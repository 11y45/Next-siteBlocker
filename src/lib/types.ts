export type CategoryId =
  | "social" | "adult" | "gambling" | "shopping" | "news" | "entertainment" | "gaming" | "other";

export interface Session {
  phase: "focus" | "break";
  cycle: number;
  cycles: number;
  focusMin: number;
  breakMin: number;
  startedAt: number;
  phaseStartedAt: number;
  phaseEndsAt: number;
  pausedAt?: number | null;
}

export interface PublicLock {
  type: "none" | "passcode" | "time";
  locked: boolean;
  until?: number;
  createdAt?: number;
  cooldownMin?: number;
  unlockRequestedAt?: number | null;
  readyAt?: number | null;
  requestExpiresAt?: number | null;
  unlockedUntil?: number | null;
  lockoutUntil?: number | null;
}

export interface Rule {
  id: string;
  name: string;
  enabled: boolean;
  sites: string[];
  categories: CategoryId[];
  allDay: boolean;
  start: string; // "HH:MM"
  end: string;
  days: number[]; // 0 = Sunday ... 6 = Saturday
  active?: boolean; // computed by the extension: is the window open right now?
}

export interface FocusConfig { focusMin: number; breakMin: number; cycles: number }
export interface DayStats { focusMin: number; sessions: number; blocks: number }

export interface ExtState {
  now: number;
  version: string;
  sites: Record<string, CategoryId>;
  settings: { blockWhen: "always" | "focus-only" };
  focusConfig: FocusConfig;
  session: Session | null;
  lock: PublicLock;
  locked: boolean;
  blockingActive: boolean;
  stats: { days: Record<string, DayStats>; sites: Record<string, number> };
  dashboardUrl: string | null;
  tracking: boolean;
  addCounts: Record<string, number>;
  rules: Rule[];
  passes: Record<string, number>;
  passesToday: number;
  passLimit: number;
  passMinutes: number;
  emergencyMinutes: number;
  emergencyLimit: number;
  emergencyToday: number;
  blockedNow: string[];
  scheduledDomains: string[];
  adultDomains: string[];
}

export type Ok<T> = { ok: true; data: T };
export type Fail = {
  ok: false;
  error: string;
  message?: string;
  data?: ExtState;
  failsLeft?: number;
  lockoutUntil?: number;
  readyAt?: number;
};
export type Result<T = ExtState> = Ok<T> | Fail;

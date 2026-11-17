"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

export type Theme = "light" | "dark" | "system";
const KEY = "sb-theme";
const ORDER: Theme[] = ["light", "dark", "system"];

function apply(theme: Theme) {
  const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

function useTheme() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const saved = localStorage.getItem(KEY) as Theme | null;
    if (saved && ORDER.includes(saved)) setTheme(saved);
  }, []);

  // keep the page in sync, and follow the operating system while "system" is selected
  useEffect(() => {
    apply(theme);
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const choose = (t: Theme) => {
    localStorage.setItem(KEY, t);
    setTheme(t);
  };
  return { theme, choose };
}

const ICONS = { light: Sun, dark: Moon, system: Monitor } as const;
const LABELS: Record<Theme, string> = { light: "Light", dark: "Dark", system: "Match system" };

/** Three-way switch for the sidebar. */
export function ThemeSwitch() {
  const { theme, choose } = useTheme();
  return (
    <div className="flex gap-1 rounded-2xl bg-fog-50 p-1" role="radiogroup" aria-label="Theme">
      {ORDER.map((t) => {
        const Icon = ICONS[t];
        const on = theme === t;
        return (
          <button
            key={t} type="button" role="radio" aria-checked={on} aria-label={LABELS[t]} title={LABELS[t]} onClick={() => choose(t)}
            className={`flex flex-1 items-center justify-center rounded-xl py-2 transition ${on ? "bg-surface text-lavender-600 shadow-soft" : "text-muted hover:text-ink"}`}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
}

/** One button that cycles light, dark, system. For the phone header. */
export function ThemeButton() {
  const { theme, choose } = useTheme();
  const Icon = ICONS[theme];
  return (
    <button
      type="button" className="btn-ghost !p-2.5" aria-label={`Theme: ${LABELS[theme]}. Tap to change.`} title={`Theme: ${LABELS[theme]}`}
      onClick={() => choose(ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length])}
    >
      <Icon size={20} />
    </button>
  );
}

/** Runs before the page paints, so dark-mode users never see a light flash. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${KEY}")||"system";var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}})();`;

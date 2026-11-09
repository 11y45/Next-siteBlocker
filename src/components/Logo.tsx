import { useId } from "react";

// Shield with a no-entry sign. Same artwork as the extension icon.
export function ShieldLogo({ size = 40, className = "" }: { size?: number; className?: string }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9283F7" />
          <stop offset="1" stopColor="#6857E0" />
        </linearGradient>
      </defs>
      <path d="M50 4 L88 17 L88 50 C88 76 64 90 50 97 C36 90 12 76 12 50 L12 17 Z" fill={`url(#${id})`} stroke={`url(#${id})`} strokeWidth="4.5" strokeLinejoin="round" />
      <circle cx="50" cy="47" r="19" fill="none" stroke="#fff" strokeWidth="5.5" />
      <line x1="36.6" y1="33.6" x2="63.4" y2="60.4" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" />
    </svg>
  );
}

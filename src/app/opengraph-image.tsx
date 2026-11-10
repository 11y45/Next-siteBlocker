import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const alt = "siteBlocker — block distracting websites";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F6FA", gap: 56 }}>
        <svg width="260" height="260" viewBox="0 0 100 100">
          <path d="M50 4 L88 17 L88 50 C88 76 64 90 50 97 C36 90 12 76 12 50 L12 17 Z" fill="#7C6CF0" stroke="#7C6CF0" strokeWidth="4.5" strokeLinejoin="round" />
          <circle cx="50" cy="47" r="19" fill="none" stroke="#fff" strokeWidth="5.5" />
          <line x1="36.6" y1="33.6" x2="63.4" y2="60.4" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 112, fontWeight: 700, color: "#1F2340", letterSpacing: -3 }}>{SITE_NAME}</div>
          <div style={{ fontSize: 40, color: "#6B7094", marginTop: 8 }}>Block distractions. Schedule focus.</div>
        </div>
      </div>
    ),
    size,
  );
}

const isDev = process.env.NODE_ENV !== "production";

// Content-Security-Policy: this page can control the browser extension, so the browser must only ever run YOUR code on it.
// - script-src has no external host: a third-party script (analytics, chat widget, a hijacked CDN) simply won't run.
// - 'unsafe-inline' stays because Next.js and the theme/JSON-LD snippets use inline scripts; 'unsafe-eval' is for dev mode only.
// - Do not add external hosts here. If you ever need analytics, put it on the public home page only, through a privacy-friendly service.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
    ];
  },
};
export default nextConfig;

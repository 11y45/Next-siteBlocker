# siteBlocker

- `siteblocker-extension/` — the Chrome extension (load unpacked)
- `siteblocker-dashboard/` — the Next.js dashboard (deploy on Vercel as `siteblocker`)

Order: deploy the dashboard → check the extension's `manifest.json` and `lib/config.js` point to it → load the extension → open the dashboard.
See the README inside each folder.

# Haven — dashboard

Next.js 16 + Tailwind CSS 3 + TypeScript. A soft, minimal SaaS-style dashboard that controls the Website Blocker extension:
blocklist, categories with popular-site suggestions, schedules (hours and days), focus timer, and protection.

There is no backend and no database. The page talks to the extension through a content script bridge,
and all data lives in the extension.

## Run locally
```bash
npm install
npm run dev        # http://localhost:3000
```
(`http://localhost:3000/*` is already in the extension's manifest.)

## Deploy to Vercel
1. Push this folder to a GitHub repo.
2. Vercel → **Add New → Project** → import it. Framework preset: Next.js. No environment variables.
3. After the first deploy, copy your production URL (e.g. `https://haven-yourname.vercel.app`).
4. In the extension, put that URL in `lib/config.js` (`DEFAULT_DASHBOARD_URL`) and in `manifest.json` → `content_scripts → matches` as `https://haven-yourname.vercel.app/*`.
5. Reload the extension and the dashboard tab. The sidebar should show **Extension connected**.

Preview deployments have different URLs, so they won't connect unless you add them to `matches`.

## Customize
- Sites and categories: `src/lib/catalog.ts`
- Colors and shadows: `tailwind.config.ts`
- Pages: `src/app/*` · Schedule editor: `src/components/RuleEditor.tsx`

# siteBlocker — dashboard

Next.js 16 + Tailwind CSS 3 + TypeScript. A soft, minimal dashboard that controls the siteBlocker extension: blocklist, categories with popular-site
suggestions, schedules (hours and days), screen time with a swipeable day/week/month/year chart and a yearly recap, focus timer with sounds, protection, and a light/dark theme. The layout is responsive (phone, tablet, desktop), but it controls the extension
in the same browser it is opened in.

There is no backend and no database. The page talks to the extension through a content script bridge, and all data lives in the extension.

## Run locally
```bash
npm install
npm run dev        # http://localhost:3000
```
(`http://localhost:3000/*` is already in the extension's manifest.)

## Deploy to Vercel
1. Push this folder to a GitHub repo and import it in Vercel. Framework preset: Next.js. No environment variables.
2. Name the project `siteblocker` to get `https://siteblocker.vercel.app`. If you use another address, change `SITE_URL` in `src/lib/site.ts`
   and the two extension settings (`lib/config.js` and `manifest.json` → `content_scripts → matches`).
3. Reload the extension and the dashboard tab. The sidebar should show **Extension connected**.

Preview deployments have different URLs, so they won't connect unless you add them to `matches`.

## SEO
Already in place: the `siteBlocker` name and title, meta description, canonical URL, Open Graph and Twitter cards, a generated share image,
JSON-LD (`SoftwareApplication`), `robots.txt`, `sitemap.xml`, and an indexable introduction on the home page (shown to visitors without the extension).
The app screens all point to the home page as canonical.

What only you can do: add the site in Google Search Console and submit `sitemap.xml`, and link to it from places people actually visit
(your GitHub README, a post, a Web Store listing if you publish one). A short descriptive domain helps too.

## Customize
- Sites and categories: `src/lib/catalog.ts` (then run `python3 tools/generate-catalog.py` in the extension to keep both in sync) · Name, URL and SEO text: `src/lib/site.ts`
- Colors and shadows: `tailwind.config.ts`
- Screen time maths (periods, buckets, recap, formatting): `src/lib/usage.ts` · swipeable pager: `src/components/Carousel.tsx`
- Theme: every color is a CSS variable in `src/app/globals.css` (light and `.dark`), wired up in `tailwind.config.ts`. The 16 color families are generated; to add one, add its tokens in both blocks and a tone in `src/lib/catalog.ts`.
- Pages: `src/app/*` · Schedule editor: `src/components/RuleEditor.tsx`

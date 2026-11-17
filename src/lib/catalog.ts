import {
  Briefcase, Clapperboard, Dices, Gamepad2, Globe, GraduationCap, Mail, Music, Newspaper, Search, ShieldAlert, ShoppingBag, Sparkles, Trophy, Users, Wallet,
  type LucideIcon,
} from "lucide-react";
import type { CategoryId } from "./types";

export interface Tone {
  wash: string;   // soft background
  chip: string;   // chip / badge
  solid: string;  // strong accent (dots, bars)
  text: string;
  ring: string;
}

// Class names are written out in full so Tailwind can see them. Each family is a theme token (light + dark).
const tones: Record<string, Tone> = {
  sky: { wash: "bg-skyblue-50", chip: "bg-skyblue-100 text-skyblue-600", solid: "bg-skyblue-500", text: "text-skyblue-600", ring: "ring-skyblue-100" },
  lav: { wash: "bg-lavender-50", chip: "bg-lavender-100 text-lavender-600", solid: "bg-lavender-500", text: "text-lavender-600", ring: "ring-lavender-100" },
  blush: { wash: "bg-blush-50", chip: "bg-blush-100 text-blush-600", solid: "bg-blush-500", text: "text-blush-600", ring: "ring-blush-100" },
  peach: { wash: "bg-peach-50", chip: "bg-peach-100 text-peach-600", solid: "bg-peach-500", text: "text-peach-600", ring: "ring-peach-100" },
  butter: { wash: "bg-butter-50", chip: "bg-butter-100 text-butter-600", solid: "bg-butter-500", text: "text-butter-600", ring: "ring-butter-100" },
  mint: { wash: "bg-mint-50", chip: "bg-mint-100 text-mint-600", solid: "bg-mint-500", text: "text-mint-600", ring: "ring-mint-100" },
  fog: { wash: "bg-fog-50", chip: "bg-fog-100 text-fog-600", solid: "bg-fog-500", text: "text-fog-600", ring: "ring-fog-100" },
  ember: { wash: "bg-ember-50", chip: "bg-ember-100 text-ember-600", solid: "bg-ember-500", text: "text-ember-600", ring: "ring-ember-100" },
  moss: { wash: "bg-moss-50", chip: "bg-moss-100 text-moss-600", solid: "bg-moss-500", text: "text-moss-600", ring: "ring-moss-100" },
  jade: { wash: "bg-jade-50", chip: "bg-jade-100 text-jade-600", solid: "bg-jade-500", text: "text-jade-600", ring: "ring-jade-100" },
  lagoon: { wash: "bg-lagoon-50", chip: "bg-lagoon-100 text-lagoon-600", solid: "bg-lagoon-500", text: "text-lagoon-600", ring: "ring-lagoon-100" },
  iris: { wash: "bg-iris-50", chip: "bg-iris-100 text-iris-600", solid: "bg-iris-500", text: "text-iris-600", ring: "ring-iris-100" },
  plum: { wash: "bg-plum-50", chip: "bg-plum-100 text-plum-600", solid: "bg-plum-500", text: "text-plum-600", ring: "ring-plum-100" },
  petal: { wash: "bg-petal-50", chip: "bg-petal-100 text-petal-600", solid: "bg-petal-500", text: "text-petal-600", ring: "ring-petal-100" },
  sand: { wash: "bg-sand-50", chip: "bg-sand-100 text-sand-600", solid: "bg-sand-500", text: "text-sand-600", ring: "ring-sand-100" },
  pine: { wash: "bg-pine-50", chip: "bg-pine-100 text-pine-600", solid: "bg-pine-500", text: "text-pine-600", ring: "ring-pine-100" },
};

export type CategoryGroup = "distraction" | "tools" | "other";

export interface Category {
  id: CategoryId;
  label: string;
  blurb: string;
  icon: LucideIcon;
  tone: Tone;
  group: CategoryGroup;
}

export const CATEGORIES: Category[] = [
  { id: "social", label: "Social media", blurb: "Feeds and chats that eat your hours.", icon: Users, tone: tones.sky, group: "distraction" },
  { id: "entertainment", label: "Entertainment", blurb: "Video, streaming and meme sites.", icon: Clapperboard, tone: tones.lav, group: "distraction" },
  { id: "gaming", label: "Gaming", blurb: "Game stores, chess and browser games.", icon: Gamepad2, tone: tones.ember, group: "distraction" },
  { id: "gambling", label: "Gambling", blurb: "Betting, casinos and poker.", icon: Dices, tone: tones.peach, group: "distraction" },
  { id: "adult", label: "Adult (18+)", blurb: "Adult content websites.", icon: ShieldAlert, tone: tones.blush, group: "distraction" },
  { id: "shopping", label: "Shopping", blurb: "Impulse buys and endless browsing.", icon: ShoppingBag, tone: tones.butter, group: "distraction" },
  { id: "news", label: "News", blurb: "Headlines that pull you into the scroll.", icon: Newspaper, tone: tones.mint, group: "distraction" },
  { id: "sports", label: "Sports", blurb: "Scores, transfers and match news.", icon: Trophy, tone: tones.pine, group: "distraction" },
  { id: "music", label: "Music", blurb: "Streaming, lyrics and playlists.", icon: Music, tone: tones.petal, group: "distraction" },
  { id: "productivity", label: "Work & tools", blurb: "Code, docs, design and team tools.", icon: Briefcase, tone: tones.iris, group: "tools" },
  { id: "education", label: "Learning", blurb: "Courses, practice and study sites.", icon: GraduationCap, tone: tones.jade, group: "tools" },
  { id: "ai", label: "AI tools", blurb: "Chatbots and AI assistants.", icon: Sparkles, tone: tones.plum, group: "tools" },
  { id: "communication", label: "Communication", blurb: "Email and video calls.", icon: Mail, tone: tones.lagoon, group: "tools" },
  { id: "search", label: "Search & reference", blurb: "Search engines, maps and encyclopedias.", icon: Search, tone: tones.sand, group: "tools" },
  { id: "finance", label: "Finance", blurb: "Payments, banking and markets.", icon: Wallet, tone: tones.moss, group: "tools" },
  { id: "other", label: "Other", blurb: "Sites without a category.", icon: Globe, tone: tones.fog, group: "other" },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, Category>;

export interface CatalogSite { name: string; domain: string; category: CategoryId }

const s = (category: CategoryId, rows: [string, string][]): CatalogSite[] =>
  rows.map(([name, domain]) => ({ name, domain, category }));

export const CATALOG: CatalogSite[] = [
  ...s("social", [
    ["Instagram", "instagram.com"], ["Facebook", "facebook.com"], ["TikTok", "tiktok.com"], ["X (Twitter)", "x.com"], ["Twitter", "twitter.com"], ["Snapchat", "snapchat.com"], ["Reddit", "reddit.com"], ["LinkedIn", "linkedin.com"], ["Pinterest", "pinterest.com"], ["Discord", "discord.com"], ["WhatsApp Web", "whatsapp.com"], ["Telegram Web", "web.telegram.org"], ["Threads", "threads.net"], ["Tumblr", "tumblr.com"], ["Bluesky", "bsky.app"], ["Quora", "quora.com"], ["VK", "vk.com"],
  ]),
  ...s("entertainment", [
    ["YouTube", "youtube.com"], ["Netflix", "netflix.com"], ["Twitch", "twitch.tv"], ["Disney+", "disneyplus.com"], ["Prime Video", "primevideo.com"], ["Hulu", "hulu.com"], ["Crunchyroll", "crunchyroll.com"], ["Dailymotion", "dailymotion.com"], ["9GAG", "9gag.com"], ["Imgur", "imgur.com"], ["Vimeo", "vimeo.com"], ["Kick", "kick.com"], ["Max", "max.com"], ["Shahid", "shahid.net"],
  ]),
  ...s("gaming", [
    ["Steam", "steampowered.com"], ["Epic Games", "epicgames.com"], ["Roblox", "roblox.com"], ["Battle.net", "battle.net"], ["EA", "ea.com"], ["itch.io", "itch.io"], ["Poki", "poki.com"], ["CrazyGames", "crazygames.com"], ["Miniclip", "miniclip.com"], ["Chess.com", "chess.com"], ["Lichess", "lichess.org"], ["Minecraft", "minecraft.net"], ["Riot Games", "riotgames.com"], ["Fortnite", "fortnite.com"], ["Xbox", "xbox.com"], ["PlayStation", "playstation.com"], ["Nintendo", "nintendo.com"],
  ]),
  ...s("gambling", [
    ["1xBet", "1xbet.com"], ["Melbet", "melbet.com"], ["Betwinner", "betwinner.com"], ["Mostbet", "mostbet.com"], ["1win", "1win.com"], ["Bet365", "bet365.com"], ["Stake", "stake.com"], ["Betway", "betway.com"], ["22Bet", "22bet.com"], ["Betfair", "betfair.com"], ["Unibet", "unibet.com"], ["PokerStars", "pokerstars.com"], ["DraftKings", "draftkings.com"], ["FanDuel", "fanduel.com"], ["William Hill", "williamhill.com"],
  ]),
  ...s("adult", [
    ["Pornhub", "pornhub.com"], ["XVideos", "xvideos.com"], ["XNXX", "xnxx.com"], ["xHamster", "xhamster.com"], ["RedTube", "redtube.com"], ["YouPorn", "youporn.com"], ["SpankBang", "spankbang.com"], ["Eporner", "eporner.com"], ["Tube8", "tube8.com"], ["OnlyFans", "onlyfans.com"], ["Chaturbate", "chaturbate.com"], ["Stripchat", "stripchat.com"], ["BongaCams", "bongacams.com"], ["CamSoda", "camsoda.com"], ["Rule34", "rule34.xxx"],
  ]),
  ...s("shopping", [
    ["Amazon", "amazon.com"], ["eBay", "ebay.com"], ["AliExpress", "aliexpress.com"], ["Temu", "temu.com"], ["Shein", "shein.com"], ["Alibaba", "alibaba.com"], ["Etsy", "etsy.com"], ["Walmart", "walmart.com"], ["Jumia", "jumia.ma"], ["Avito", "avito.ma"], ["Zalando", "zalando.com"], ["ASOS", "asos.com"], ["Target", "target.com"], ["Best Buy", "bestbuy.com"], ["Noon", "noon.com"], ["IKEA", "ikea.com"], ["Decathlon", "decathlon.com"], ["Marjane", "marjane.ma"], ["Vinted", "vinted.com"],
  ]),
  ...s("news", [
    ["CNN", "cnn.com"], ["BBC", "bbc.com"], ["The New York Times", "nytimes.com"], ["The Guardian", "theguardian.com"], ["Al Jazeera", "aljazeera.com"], ["Reuters", "reuters.com"], ["AP News", "apnews.com"], ["Fox News", "foxnews.com"], ["Bloomberg", "bloomberg.com"], ["Hespress", "hespress.com"], ["Le360", "le360.ma"], ["Medias24", "medias24.com"], ["Google News", "news.google.com"], ["Hacker News", "news.ycombinator.com"], ["Le Matin", "lematin.ma"], ["Yabiladi", "yabiladi.com"], ["TelQuel", "telquel.ma"], ["H24info", "h24info.ma"], ["Bladi", "bladi.net"], ["Le Monde", "lemonde.fr"], ["Le Figaro", "lefigaro.fr"], ["El País", "elpais.com"], ["The Washington Post", "washingtonpost.com"], ["Forbes", "forbes.com"], ["TechCrunch", "techcrunch.com"], ["The Verge", "theverge.com"],
  ]),
  ...s("sports", [
    ["ESPN", "espn.com"], ["Flashscore", "flashscore.com"], ["SofaScore", "sofascore.com"], ["Kooora", "kooora.com"], ["Goal", "goal.com"], ["beIN Sports", "beinsports.com"], ["Transfermarkt", "transfermarkt.com"], ["NBA", "nba.com"], ["UEFA", "uefa.com"], ["FIFA", "fifa.com"], ["Sky Sports", "skysports.com"], ["OneFootball", "onefootball.com"], ["365Scores", "365scores.com"],
  ]),
  ...s("music", [
    ["Spotify", "spotify.com"], ["SoundCloud", "soundcloud.com"], ["Deezer", "deezer.com"], ["Apple Music", "music.apple.com"], ["YouTube Music", "music.youtube.com"], ["Anghami", "anghami.com"], ["Tidal", "tidal.com"], ["Bandcamp", "bandcamp.com"], ["Shazam", "shazam.com"], ["Genius", "genius.com"], ["Last.fm", "last.fm"],
  ]),
  ...s("productivity", [
    ["GitHub", "github.com"], ["GitLab", "gitlab.com"], ["Stack Overflow", "stackoverflow.com"], ["Notion", "notion.so"], ["Trello", "trello.com"], ["Asana", "asana.com"], ["Slack", "slack.com"], ["Figma", "figma.com"], ["Canva", "canva.com"], ["Linear", "linear.app"], ["Jira", "atlassian.net"], ["Google Docs", "docs.google.com"], ["Google Drive", "drive.google.com"], ["Google Calendar", "calendar.google.com"], ["Microsoft 365", "office.com"], ["Vercel", "vercel.com"], ["Netlify", "netlify.com"], ["Dropbox", "dropbox.com"], ["CodePen", "codepen.io"], ["Replit", "replit.com"], ["npm", "npmjs.com"], ["Postman", "postman.com"], ["Cloudflare", "cloudflare.com"], ["AWS", "aws.amazon.com"],
  ]),
  ...s("education", [
    ["Coursera", "coursera.org"], ["Udemy", "udemy.com"], ["Khan Academy", "khanacademy.org"], ["edX", "edx.org"], ["Duolingo", "duolingo.com"], ["LeetCode", "leetcode.com"], ["HackerRank", "hackerrank.com"], ["W3Schools", "w3schools.com"], ["MDN Web Docs", "developer.mozilla.org"], ["freeCodeCamp", "freecodecamp.org"], ["GeeksforGeeks", "geeksforgeeks.org"], ["Codecademy", "codecademy.com"], ["Google Scholar", "scholar.google.com"], ["arXiv", "arxiv.org"], ["Udacity", "udacity.com"], ["Brilliant", "brilliant.org"], ["Quizlet", "quizlet.com"],
  ]),
  ...s("ai", [
    ["ChatGPT", "chatgpt.com"], ["OpenAI", "openai.com"], ["Claude", "claude.ai"], ["Gemini", "gemini.google.com"], ["Perplexity", "perplexity.ai"], ["Copilot", "copilot.microsoft.com"], ["Hugging Face", "huggingface.co"], ["Midjourney", "midjourney.com"], ["Character.AI", "character.ai"], ["DeepSeek", "deepseek.com"], ["Grok", "grok.com"], ["Mistral", "mistral.ai"], ["Poe", "poe.com"], ["Suno", "suno.com"],
  ]),
  ...s("communication", [
    ["Gmail", "mail.google.com"], ["Outlook", "outlook.live.com"], ["Outlook (work)", "outlook.office.com"], ["Zoom", "zoom.us"], ["Google Meet", "meet.google.com"], ["Microsoft Teams", "teams.microsoft.com"], ["Proton Mail", "proton.me"], ["Yahoo Mail", "mail.yahoo.com"], ["Skype", "skype.com"], ["Messenger", "messenger.com"],
  ]),
  ...s("search", [
    ["Google", "google.com"], ["Bing", "bing.com"], ["DuckDuckGo", "duckduckgo.com"], ["Wikipedia", "wikipedia.org"], ["Google Maps", "maps.google.com"], ["Google Translate", "translate.google.com"], ["Yahoo", "yahoo.com"], ["Brave Search", "search.brave.com"], ["wikiHow", "wikihow.com"], ["Wolfram Alpha", "wolframalpha.com"],
  ]),
  ...s("finance", [
    ["PayPal", "paypal.com"], ["Binance", "binance.com"], ["Coinbase", "coinbase.com"], ["TradingView", "tradingview.com"], ["Wise", "wise.com"], ["Revolut", "revolut.com"], ["Investing.com", "investing.com"], ["CoinMarketCap", "coinmarketcap.com"], ["Stripe", "stripe.com"], ["Payoneer", "payoneer.com"], ["Yahoo Finance", "finance.yahoo.com"], ["CIH Bank", "cihbank.ma"], ["Attijariwafa Bank", "attijariwafabank.com"],
  ]),
];

export const CATALOG_BY_DOMAIN = Object.fromEntries(CATALOG.map((c) => [c.domain, c]));

export function searchCatalog(query: string, limit = 7): CatalogSite[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return CATALOG.filter((c) => c.name.toLowerCase().includes(q) || c.domain.includes(q))
    .sort((a, b) => Number(!a.name.toLowerCase().startsWith(q)) - Number(!b.name.toLowerCase().startsWith(q)))
    .slice(0, limit);
}

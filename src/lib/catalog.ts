import {
  Users, ShieldAlert, Dices, ShoppingBag, Newspaper, Clapperboard, Gamepad2, Globe,
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

const tones: Record<string, Tone> = {
  sky:    { wash: "bg-skyblue-50",  chip: "bg-skyblue-100 text-skyblue-600",  solid: "bg-skyblue-500",  text: "text-skyblue-600",  ring: "ring-skyblue-100" },
  blush:  { wash: "bg-blush-50",    chip: "bg-blush-100 text-blush-600",      solid: "bg-blush-500",    text: "text-blush-600",    ring: "ring-blush-100" },
  peach:  { wash: "bg-peach-50",    chip: "bg-peach-100 text-peach-600",      solid: "bg-peach-500",    text: "text-peach-600",    ring: "ring-peach-100" },
  butter: { wash: "bg-butter-50",   chip: "bg-butter-100 text-butter-600",    solid: "bg-butter-500",   text: "text-butter-600",   ring: "ring-butter-100" },
  mint:   { wash: "bg-mint-50",     chip: "bg-mint-100 text-mint-600",        solid: "bg-mint-500",     text: "text-mint-600",     ring: "ring-mint-100" },
  lav:    { wash: "bg-lavender-50", chip: "bg-lavender-100 text-lavender-600", solid: "bg-lavender-500", text: "text-lavender-600", ring: "ring-lavender-100" },
  fog:    { wash: "bg-fog-50",      chip: "bg-fog-100 text-fog-600",          solid: "bg-fog-500",      text: "text-fog-600",      ring: "ring-fog-100" },
};

export interface Category {
  id: CategoryId;
  label: string;
  blurb: string;
  icon: LucideIcon;
  tone: Tone;
}

export const CATEGORIES: Category[] = [
  { id: "social",        label: "Social media",  blurb: "Feeds and chats that eat your hours.",          icon: Users,        tone: tones.sky },
  { id: "adult",         label: "Adult (18+)",   blurb: "Adult content websites.",                        icon: ShieldAlert,  tone: tones.blush },
  { id: "gambling",      label: "Gambling",      blurb: "Betting, casinos and poker.",                    icon: Dices,        tone: tones.peach },
  { id: "shopping",      label: "Shopping",      blurb: "Impulse buys and endless browsing.",             icon: ShoppingBag,  tone: tones.butter },
  { id: "news",          label: "News",          blurb: "Headlines that pull you into the scroll.",       icon: Newspaper,    tone: tones.mint },
  { id: "entertainment", label: "Entertainment", blurb: "Video, streaming and meme sites.",               icon: Clapperboard, tone: tones.lav },
  { id: "gaming",        label: "Gaming",        blurb: "Game stores and browser games.",                 icon: Gamepad2,     tone: tones.fog },
  { id: "other",         label: "Custom",        blurb: "Sites you added yourself.",                      icon: Globe,        tone: tones.fog },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, Category>;

export interface CatalogSite { name: string; domain: string; category: CategoryId }

const s = (category: CategoryId, rows: [string, string][]): CatalogSite[] =>
  rows.map(([name, domain]) => ({ name, domain, category }));

export const CATALOG: CatalogSite[] = [
  ...s("social", [
    ["Instagram", "instagram.com"], ["Facebook", "facebook.com"], ["TikTok", "tiktok.com"],
    ["X (Twitter)", "x.com"], ["Twitter", "twitter.com"], ["Snapchat", "snapchat.com"],
    ["Reddit", "reddit.com"], ["LinkedIn", "linkedin.com"], ["Pinterest", "pinterest.com"],
    ["Discord", "discord.com"], ["WhatsApp Web", "whatsapp.com"], ["Telegram Web", "web.telegram.org"],
    ["Threads", "threads.net"], ["Tumblr", "tumblr.com"], ["Bluesky", "bsky.app"],
  ]),
  ...s("adult", [
    ["Pornhub", "pornhub.com"], ["XVideos", "xvideos.com"], ["XNXX", "xnxx.com"],
    ["xHamster", "xhamster.com"], ["RedTube", "redtube.com"], ["YouPorn", "youporn.com"],
    ["SpankBang", "spankbang.com"], ["Eporner", "eporner.com"], ["Tube8", "tube8.com"],
    ["OnlyFans", "onlyfans.com"], ["Chaturbate", "chaturbate.com"], ["Stripchat", "stripchat.com"],
    ["BongaCams", "bongacams.com"], ["CamSoda", "camsoda.com"], ["Rule34", "rule34.xxx"],
  ]),
  ...s("gambling", [
    ["1xBet", "1xbet.com"], ["Melbet", "melbet.com"], ["Betwinner", "betwinner.com"],
    ["Mostbet", "mostbet.com"], ["1win", "1win.com"], ["Bet365", "bet365.com"],
    ["Stake", "stake.com"], ["Betway", "betway.com"], ["22Bet", "22bet.com"],
    ["Betfair", "betfair.com"], ["Unibet", "unibet.com"], ["PokerStars", "pokerstars.com"],
    ["DraftKings", "draftkings.com"], ["FanDuel", "fanduel.com"], ["William Hill", "williamhill.com"],
  ]),
  ...s("shopping", [
    ["Amazon", "amazon.com"], ["eBay", "ebay.com"], ["AliExpress", "aliexpress.com"],
    ["Temu", "temu.com"], ["Shein", "shein.com"], ["Alibaba", "alibaba.com"],
    ["Etsy", "etsy.com"], ["Walmart", "walmart.com"], ["Jumia", "jumia.ma"],
    ["Avito", "avito.ma"], ["Zalando", "zalando.com"], ["ASOS", "asos.com"],
    ["Target", "target.com"], ["Best Buy", "bestbuy.com"],
  ]),
  ...s("news", [
    ["CNN", "cnn.com"], ["BBC", "bbc.com"], ["The New York Times", "nytimes.com"],
    ["The Guardian", "theguardian.com"], ["Al Jazeera", "aljazeera.com"], ["Reuters", "reuters.com"],
    ["AP News", "apnews.com"], ["Fox News", "foxnews.com"], ["Bloomberg", "bloomberg.com"],
    ["Hespress", "hespress.com"], ["Le360", "le360.ma"], ["Medias24", "medias24.com"],
    ["Google News", "news.google.com"], ["Hacker News", "news.ycombinator.com"],
  ]),
  ...s("entertainment", [
    ["YouTube", "youtube.com"], ["Netflix", "netflix.com"], ["Twitch", "twitch.tv"],
    ["Disney+", "disneyplus.com"], ["Prime Video", "primevideo.com"], ["Hulu", "hulu.com"],
    ["Crunchyroll", "crunchyroll.com"], ["Dailymotion", "dailymotion.com"], ["9GAG", "9gag.com"],
    ["Imgur", "imgur.com"],
  ]),
  ...s("gaming", [
    ["Steam", "steampowered.com"], ["Epic Games", "epicgames.com"], ["Roblox", "roblox.com"],
    ["Battle.net", "battle.net"], ["EA", "ea.com"], ["itch.io", "itch.io"],
    ["Poki", "poki.com"], ["CrazyGames", "crazygames.com"], ["Miniclip", "miniclip.com"],
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

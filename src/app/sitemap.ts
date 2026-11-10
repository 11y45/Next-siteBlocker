import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Only the home page is listed: the other routes are the app itself and all canonicalize to "/".
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL, changeFrequency: "monthly", priority: 1 }];
}

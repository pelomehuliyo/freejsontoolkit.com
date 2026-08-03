import type { APIRoute } from "astro";
import { tools } from "../lib/tools/registry";
import { COMPARISONS } from "../lib/tools/comparisons";

interface SitemapEntry {
  loc: string;
  priority: string;
  changefreq: string;
}

// Priority tiers: homepage + catalog lead (they change as tools ship and are
// the entry points), individual tools next, comparisons + the trust page
// after, legal/contact pages last. changefreq/priority are crawler hints,
// not commands — but they cost nothing and help smaller engines.
const STATIC_ROUTES: SitemapEntry[] = [
  { loc: "", priority: "1.0", changefreq: "weekly" },
  { loc: "/tools", priority: "0.9", changefreq: "weekly" },
  { loc: "/collections", priority: "0.7", changefreq: "weekly" },
  { loc: "/collections/json", priority: "0.6", changefreq: "monthly" },
  { loc: "/collections/encoding", priority: "0.6", changefreq: "monthly" },
  { loc: "/collections/data-formats", priority: "0.6", changefreq: "monthly" },
  { loc: "/collections/developer-utilities", priority: "0.6", changefreq: "monthly" },
  { loc: "/collections/networking", priority: "0.6", changefreq: "monthly" },
  { loc: "/compare", priority: "0.7", changefreq: "monthly" },
  { loc: "/why-local", priority: "0.6", changefreq: "monthly" },
  { loc: "/about", priority: "0.4", changefreq: "yearly" },
  { loc: "/contact", priority: "0.3", changefreq: "yearly" },
  { loc: "/privacy", priority: "0.2", changefreq: "yearly" },
  { loc: "/terms", priority: "0.2", changefreq: "yearly" },
  { loc: "/disclaimer", priority: "0.2", changefreq: "yearly" },
];

export const GET: APIRoute = async ({ site }) => {
  const base = (site ?? new URL("https://freejsontoolkit.com")).toString().replace(/\/$/, "");

  // Tools + comparisons derive from the spines — a new registry entry or a new
  // comparison lands here automatically, in the right tier, forever.
  const toolEntries: SitemapEntry[] = tools
    .filter((t) => t.status === "available" && t.href)
    .map((t) => ({ loc: t.href as string, priority: "0.8", changefreq: "monthly" }));
  const compareEntries: SitemapEntry[] = Object.values(COMPARISONS).map((c) => ({
    loc: `/compare/${c.slug}`,
    priority: "0.6",
    changefreq: "monthly",
  }));

  // Dedupe by loc (first wins) so the spines can never double-emit a route.
  const seen = new Set<string>();
  const entries = [...STATIC_ROUTES, ...toolEntries, ...compareEntries].filter((e) => {
    if (seen.has(e.loc)) return false;
    seen.add(e.loc);
    return true;
  });

  const urls = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${base}${e.loc}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
};
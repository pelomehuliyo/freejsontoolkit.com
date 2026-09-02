import type { APIRoute } from "astro";
import { tools, familiesWithAvailableTools } from "../lib/tools/registry";
import { COMPARISONS } from "../lib/tools/comparisons";
import { ARTICLES } from "../lib/learn/articles";
import { dateForPublishedIn, SITE_LAST_MODIFIED } from "../lib/seo/authors";

interface SitemapEntry {
  loc: string;
  priority: string;
  changefreq: string;
  lastmod?: string;
}

// Priority tiers: homepage + catalog lead (they change as tools ship and are
// the entry points), individual tools next, comparisons + the trust page
// after, legal/contact pages last. Collection family pages derive from the
// registry below — only families with at least one live tool get pushed, so
// placeholder routes never waste crawl budget. changefreq/priority are
// crawler hints, not commands — but they cost nothing and help smaller engines.
const STATIC_ROUTES: SitemapEntry[] = [
  { loc: "", priority: "1.0", changefreq: "weekly", lastmod: SITE_LAST_MODIFIED },
  { loc: "/tools", priority: "0.9", changefreq: "weekly", lastmod: SITE_LAST_MODIFIED },
  { loc: "/large-files", priority: "0.7", changefreq: "weekly", lastmod: SITE_LAST_MODIFIED },
  { loc: "/collections", priority: "0.7", changefreq: "weekly", lastmod: SITE_LAST_MODIFIED },
  { loc: "/compare", priority: "0.7", changefreq: "monthly", lastmod: SITE_LAST_MODIFIED },
  { loc: "/learn", priority: "0.7", changefreq: "weekly", lastmod: SITE_LAST_MODIFIED },
  { loc: "/why-local", priority: "0.6", changefreq: "monthly", lastmod: SITE_LAST_MODIFIED },
  { loc: "/about", priority: "0.4", changefreq: "yearly", lastmod: SITE_LAST_MODIFIED },
  { loc: "/contact", priority: "0.3", changefreq: "yearly", lastmod: SITE_LAST_MODIFIED },
  { loc: "/privacy", priority: "0.2", changefreq: "yearly", lastmod: SITE_LAST_MODIFIED },
  { loc: "/terms", priority: "0.2", changefreq: "yearly", lastmod: SITE_LAST_MODIFIED },
  { loc: "/disclaimer", priority: "0.2", changefreq: "yearly", lastmod: SITE_LAST_MODIFIED },
];

export const GET: APIRoute = async ({ site }) => {
  const base = (site ?? new URL("https://www.freejsontoolkit.com")).toString().replace(/\/$/, "");

  // Tools + comparisons derive from the spines — a new registry entry or a new
  // comparison lands here automatically, in the right tier, forever.
  const toolEntries: SitemapEntry[] = tools
    .filter((t) => t.status === "available" && t.href)
    .map((t) => ({ loc: t.href as string, priority: "0.8", changefreq: "monthly", lastmod: SITE_LAST_MODIFIED }));
  const collectionEntries: SitemapEntry[] = familiesWithAvailableTools().map((g) => ({
    loc: `/collections/${g.meta.id}`,
    priority: "0.6",
    changefreq: "monthly",
    lastmod: SITE_LAST_MODIFIED,
  }));
  const compareEntries: SitemapEntry[] = Object.values(COMPARISONS).map((c) => ({
    loc: `/compare/${c.slug}`,
    priority: "0.6",
    changefreq: "monthly",
    lastmod: SITE_LAST_MODIFIED,
  }));
  const learnEntries: SitemapEntry[] = ARTICLES.map((a) => ({
    loc: `/learn/${a.slug}`,
    priority: "0.6",
    changefreq: "monthly",
    lastmod: dateForPublishedIn(a.publishedIn),
  }));

  // Dedupe by loc (first wins) so the spines can never double-emit a route.
  const seen = new Set<string>();
  const entries = [...STATIC_ROUTES, ...toolEntries, ...collectionEntries, ...compareEntries, ...learnEntries].filter((e) => {
    if (seen.has(e.loc)) return false;
    seen.add(e.loc);
    return true;
  });

  const urls = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${base}${e.loc}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ""}\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
};

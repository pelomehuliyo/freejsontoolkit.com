import type { APIRoute } from "astro";
import { tools } from "../lib/tools/registry";
import { COMPARISONS } from "../lib/tools/comparisons";

const STATIC_ROUTES = [
  "",
  "/tools",
  "/compare",
  "/about",
  "/why-local",
  "/contact",
  "/privacy",
  "/terms",
  "/disclaimer",
];

export const GET: APIRoute = async ({ site }) => {
  const base = (site ?? new URL("https://freejsontoolkit.com")).toString().replace(/\/$/, "");
  const toolRoutes = tools
    .filter((t) => t.status === "available" && t.href)
    .map((t) => t.href as string);
  const compareRoutes = Object.values(COMPARISONS).map((c) => `/compare/${c.slug}`);
  const routes = [...new Set([...STATIC_ROUTES, ...toolRoutes, ...compareRoutes])];
  const urls = routes.map((r) => `  <url><loc>${base}${r}</loc></url>`).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
};
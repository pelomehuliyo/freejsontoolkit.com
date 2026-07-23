import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const pages = ["", "/tools/json-to-csv"];

  const siteUrl = "https://freejsontoolkit.com";

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map((page) => {
      const loc = `${siteUrl}${page}`;
      return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === "" ? "1.0" : "0.8"}</priority>
  </url>`;
    })
    .join("")}
</urlset>`;

  return new Response(sitemap.trim(), {
    headers: {
      "Content-Type": "application/xml",
    },
  });
};

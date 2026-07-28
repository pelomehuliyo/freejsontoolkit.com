import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const siteUrl = "https://freejsontoolkit.com";

  const pages = [
    { path: "", priority: "1.0", changefreq: "weekly" },
    { path: "/tools", priority: "0.9", changefreq: "weekly" },
    { path: "/tools/json-to-csv", priority: "0.9", changefreq: "weekly" },
    { path: "/about", priority: "0.5", changefreq: "monthly" },
    { path: "/contact", priority: "0.5", changefreq: "monthly" },
    { path: "/privacy", priority: "0.4", changefreq: "monthly" },
    { path: "/terms", priority: "0.4", changefreq: "monthly" },
    { path: "/disclaimer", priority: "0.3", changefreq: "monthly" },
    { path: "/sandbox", priority: "0.3", changefreq: "monthly" },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
      .map(
        (page) => `  <url>
    <loc>${siteUrl}${page.path}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
      )
      .join("\n")}
</urlset>`;

  return new Response(sitemap.trim(), {
    headers: {
      "Content-Type": "application/xml",
    },
  });
};


/**
 * SEO structured data — builds schema.org JSON-LD for every page role.
 *
 * Single source of truth is the tool registry (name, tagline, keywords,
 * category, family, addedIn); the FAQ content comes from lib/tools/faq.ts.
 * Framework-free (no Astro imports) so it runs under vitest and is shared by
 * the layout head. A page that should carry no schema returns null.
 */
import {
  availableTools,
  families,
  tools,
  categoryLabel,
  familyLabel,
  type ToolManifest,
} from "../tools/registry";
import { FAQS } from "../tools/faq";

export interface StructuredDataOptions {
  /** Astro.url.pathname (may include a trailing slash) */
  pathname: string;
  /** Site origin, e.g. "https://freejsontoolkit.com/" */
  site: string;
  /** Page <title> */
  title: string;
  /** Page meta description */
  description: string;
}

const SITE_NAME = "Free JSON Toolkit";
const SCHEMA = "https://schema.org";

/** Normalize a pathname: keep "/" as-is, strip trailing slashes elsewhere. */
function stripPath(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

/** Root-relative path → absolute URL, tolerating a trailing slash on site. */
function urlFor(site: string, path: string): string {
  return site.replace(/\/$/, "") + path;
}

function organization(site: string): object {
  return {
    "@type": "Organization",
    name: SITE_NAME,
    url: urlFor(site, "/"),
    logo: {
      "@type": "ImageObject",
      url: urlFor(site, "/web-app-manifest-192x192.png"),
    },
  };
}

function pageShell(type: string, o: StructuredDataOptions, site: string): object {
  return {
    "@context": SCHEMA,
    "@type": type,
    name: o.title,
    url: urlFor(site, stripPath(o.pathname)),
    description: o.description,
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: urlFor(site, "/"),
    },
  };
}

function homeSchema(o: StructuredDataOptions, site: string): object {
  return {
    "@context": SCHEMA,
    "@type": "WebSite",
    name: SITE_NAME,
    url: urlFor(site, "/"),
    description: o.description,
    inLanguage: "en",
    publisher: organization(site),
    potentialAction: {
      "@type": "SearchAction",
      target: `${urlFor(site, "/")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

function toolSchema(tool: ToolManifest, o: StructuredDataOptions, site: string): object {
  const toolUrl = urlFor(site, tool.href as string);
  return {
    "@context": SCHEMA,
    "@type": "WebApplication",
    name: tool.name,
    url: toolUrl,
    description: tool.tagline,
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: categoryLabel(tool.category),
    operatingSystem: "All",
    browserRequirements: "Requires HTML5, JavaScript",
    softwareVersion: tool.addedIn,
    keywords: tool.keywords?.length ? tool.keywords.join(", ") : undefined,
    inLanguage: "en",
    isFamilyFriendly: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      url: toolUrl,
    },
    publisher: organization(site),
  };
}

/**
 * BreadcrumbList for tool pages — mirrors the rendered ToolHeader trail
 * (Home → Family → Tool). Returns null on non-tool routes.
 */
export function buildBreadcrumbJsonLd(o: { pathname: string; site: string }): object | null {
  const site = o.site.replace(/\/$/, "");
  const path = stripPath(o.pathname);
  const tool = tools.find((t) => t.href === path);
  if (!tool || tool.status !== "available") return null;

  return {
    "@context": SCHEMA,
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: urlFor(site, "/") },
      {
        "@type": "ListItem",
        position: 2,
        name: familyLabel(tool.family),
        item: urlFor(site, `/collections/${tool.family}`),
      },
      { "@type": "ListItem", position: 3, name: tool.name, item: urlFor(site, tool.href as string) },
    ],
  };
}

function collectionSchema(itemTools: ToolManifest[], o: StructuredDataOptions, site: string): object {
  return {
    "@context": SCHEMA,
    "@type": "CollectionPage",
    name: o.title,
    url: urlFor(site, stripPath(o.pathname)),
    description: o.description,
    inLanguage: "en",
    hasPart: {
      "@type": "ItemList",
      itemListElement: itemTools.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.name,
        url: urlFor(site, t.href as string),
      })),
    },
  };
}

/**
 * Primary schema for the current route, or null when the page should carry no
 * structured data (404, anything flagged noindex by the caller).
 */
export function buildJsonLd(o: StructuredDataOptions): object | null {
  const site = o.site.replace(/\/$/, "");
  const path = stripPath(o.pathname);

  if (path === "/") return homeSchema(o, site);
  if (path === "/404") return null;

  const tool = tools.find((t) => t.href === path);
  if (tool && tool.status === "available") return toolSchema(tool, o, site);

  if (path === "/tools" || path === "/collections") {
    return collectionSchema(availableTools, o, site);
  }
  if (path.startsWith("/collections/")) {
    const fam = families.find((f) => `/collections/${f.id}` === path);
    if (fam) {
      return collectionSchema(availableTools.filter((t) => t.family === fam.id), o, site);
    }
  }

  if (path === "/about") return pageShell("AboutPage", o, site);
  if (path === "/contact") return pageShell("ContactPage", o, site);

  return pageShell("WebPage", o, site);
}

/**
 * FAQPage schema for the homepage and tool pages that have FAQ content, or
 * null when the route has no FAQ entry.
 */
export function buildFaqJsonLd(o: { pathname: string; site: string }): object | null {
  const path = stripPath(o.pathname);
  const key = path === "/" ? "home" : tools.find((t) => t.href === path)?.id;
  const faqs = key ? FAQS[key] : undefined;
  if (!faqs || faqs.length === 0) return null;

  return {
    "@context": SCHEMA,
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
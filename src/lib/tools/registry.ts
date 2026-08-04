/**
 * ─────────────────────────────────────────────────────────────────────────
 *  TOOL REGISTRY — the single source of truth for Free JSON Toolkit.
 * ─────────────────────────────────────────────────────────────────────────
 *  Everything the site shows about "what tools exist" derives from THIS
 *  array: the /tools catalog, the footer columns, (next) the sitemap, the
 *  header menu, and each page's SEO meta + JSON-LD.
 *
 *  ADDING A TOOL = one entry here + one page under src/pages/tools/.
 *  Nothing else. No editing the footer. No editing the catalog. No drift.
 *
 *  Keep this file framework-free (no Astro imports) so build-time tooling
 *  (sitemap, RSS, JSON-LD generation) can import it directly.
 */

export type ToolCategory =
  "convert" | "format" | "validate" | "compare" | "generate" | "utilities" | "api";

export type ToolStatus = "available" | "soon" | "planned";

/**
 * A family is the USER's mental-model grouping ("I need to work with JSON"),
 * distinct from `category` (the operational type: convert / validate / …).
 * Each tool gets exactly one family home; the Collections layer derives from
 * this field, so a new tool declares its home here and appears everywhere.
 */
export type ToolFamily =
  "json" | "encoding" | "data-formats" | "developer-utilities" | "networking";

export interface ToolManifest {
  /** Stable id, matches the URL slug: /tools/<id> */
  id: string;
  /** Display name */
  name: string;
  /** One-line description used in cards, footer, meta description */
  tagline: string;
  category: ToolCategory;
  /** The user-facing collection this tool calls home. */
  family: ToolFamily;
  status: ToolStatus;
  /** Present only when status === "available" */
  href?: string;
  /** High-intent SEO keywords this tool targets */
  keywords: string[];
  /** Version it shipped in, or targets — e.g. "v1.0", "v1.1" */
  addedIn?: string;
  /** Surface in the featured slot (catalog hero / homepage) */
  featured?: boolean;
}

export interface CategoryMeta {
  id: ToolCategory;
  label: string;
  blurb: string;
}

export interface FamilyMeta {
  id: ToolFamily;
  label: string;
  blurb: string;
}

/** Category order = the order the directory and nav render in. */
export const categories: CategoryMeta[] = [
  {
    id: "convert",
    label: "Convert",
    blurb: "Move data between formats without leaving the browser.",
  },
  { id: "format", label: "Format", blurb: "Beautify, minify, and normalize structured data." },
  { id: "validate", label: "Validate", blurb: "Catch syntax and schema errors before they ship." },
  { id: "compare", label: "Compare", blurb: "Diff two inputs and see exactly what changed." },
  { id: "generate", label: "Generate", blurb: "Mock data, IDs, and sample payloads on demand." },
  { id: "utilities", label: "Utilities", blurb: "The everyday encode / decode / inspect toolbox." },
  { id: "api", label: "API", blurb: "Build and inspect requests — coming later." },
];

/** Family order = the order Collections will render in. */
export const families: FamilyMeta[] = [
  { id: "json", label: "JSON Tools", blurb: "Format, validate, convert and generate JSON." },
  { id: "encoding", label: "Encoding", blurb: "Encode, decode and generate everyday values." },
  {
    id: "data-formats",
    label: "Data Formats",
    blurb: "Work with CSV, TSV and other tabular formats.",
  },
  {
    id: "developer-utilities",
    label: "Developer Utilities",
    blurb: "Regex, diffs and other daily drivers.",
  },
  { id: "networking", label: "Networking", blurb: "Build and inspect HTTP requests." },
];

/**
 * The catalog. This is a seed that mirrors the roadmap — extend it as tools
 * ship. NOTE: "JSON Beautifier" and "JSON Pretty Print" are folded into
 * "JSON Formatter" (one tool, many keywords) so we never build the same
 * thing twice; "Minifier" stays separate because it's a genuinely different
 * operation.
 */
export const tools: ToolManifest[] = [
  // ── Convert ──────────────────────────────────────────────────────────
  {
    id: "json-to-csv",
    name: "JSON → CSV",
    tagline: "Flatten nested JSON arrays into clean CSV tables.",
    category: "convert",
    family: "json",
    status: "available",
    href: "/tools/json-to-csv",
    keywords: ["json to csv", "convert json to csv", "json to csv online"],
    addedIn: "v1.0",
    featured: true,
  },
  {
    id: "toml-to-json",
    name: "TOML → JSON",
    tagline: "Convert TOML configs into JSON.",
    category: "convert",
    status: "available",
    href: "/tools/toml-to-json",
    keywords: ["toml to json", "convert toml to json", "toml parser online"],
    addedIn: "v1.5",
    family: "data-formats",
  },
  {
    id: "csv-to-json",
    name: "CSV → JSON",
    tagline: "Convert CSV files into structured JSON.",
    category: "convert",
    family: "json",
    status: "available",
    href: "/tools/csv-to-json",
    keywords: ["csv to json", "convert csv to json"],
    addedIn: "v1.1",
  },
  {
    id: "json-to-xml",
    name: "JSON → XML",
    tagline: "Transform JSON into well-formed XML.",
    category: "convert",
    family: "json",
    status: "available",
    href: "/tools/json-to-xml",
    keywords: ["json to xml", "convert json to xml"],
    addedIn: "v1.4",
  },
  {
    id: "xml-to-json",
    name: "XML → JSON",
    tagline: "Parse XML documents into JSON objects.",
    category: "convert",
    family: "json",
    status: "available",
    href: "/tools/xml-to-json",
    keywords: ["xml to json", "convert xml to json"],
    addedIn: "v1.4",
  },
  {
    id: "yaml-to-json",
    name: "YAML → JSON",
    tagline: "Convert YAML configs into JSON.",
    category: "convert",
    family: "json",
    status: "available",
    href: "/tools/yaml-to-json",
    keywords: ["yaml to json", "convert yaml to json"],
    addedIn: "v1.4",
  },
  {
    id: "json-to-yaml",
    name: "JSON → YAML",
    tagline: "Turn JSON into readable YAML.",
    category: "convert",
    family: "json",
    status: "available",
    href: "/tools/json-to-yaml",
    keywords: ["json to yaml", "convert json to yaml"],
    addedIn: "v1.4",
  },
  {
    id: "csv-to-tsv",
    name: "CSV → TSV",
    tagline: "Convert comma-separated tables into tab-separated values.",
    category: "convert",
    status: "available",
    href: "/tools/csv-to-tsv",
    keywords: ["csv to tsv", "convert csv to tsv", "csv to tab separated"],
    addedIn: "v1.5",
    family: "data-formats",
  },
  {
    id: "tsv-to-csv",
    name: "TSV → CSV",
    tagline: "Turn tab-separated tables into clean, quoted CSV.",
    category: "convert",
    status: "available",
    href: "/tools/tsv-to-csv",
    keywords: ["tsv to csv", "convert tsv to csv", "tab separated to csv"],
    addedIn: "v1.5",
    family: "data-formats",
  },
  // ── Format ───────────────────────────────────────────────────────────
  {
    id: "json-formatter",
    name: "JSON Formatter",
    tagline: "Beautify and pretty-print JSON with consistent indentation.",
    category: "format",
    family: "json",
    status: "available",
    href: "/tools/json-formatter",
    // captures formatter / beautifier / pretty-print intent in one tool
    keywords: ["json formatter", "json beautifier", "json pretty print", "prettify json"],
    addedIn: "v1.1",
  },
  {
    id: "json-minifier",
    name: "JSON Minifier",
    tagline: "Strip whitespace to shrink JSON while preserving correctness.",
    category: "format",
    family: "json",
    status: "available",
    href: "/tools/json-minifier",
    keywords: ["json minifier", "minify json", "compress json"],
    addedIn: "v1.3",
  },

  // ── Validate ─────────────────────────────────────────────────────────
  {
    id: "json-validator",
    name: "JSON Validator",
    tagline: "Check JSON syntax and pinpoint the exact error line.",
    category: "validate",
    family: "json",
    status: "available",
    href: "/tools/json-validator",
    keywords: ["json validator", "validate json", "json syntax checker"],
    addedIn: "v1.2",
  },
  {
    id: "json-schema-validator",
    name: "JSON Schema Validator",
    tagline: "Validate JSON against a schema, fully offline.",
    category: "validate",
    family: "json",
    status: "planned",
    keywords: ["json schema validator", "validate json against schema"],
    addedIn: "v2.0",
  },

  // ── Compare ──────────────────────────────────────────────────────────
  {
    id: "json-diff",
    name: "JSON Diff",
    tagline: "Compare two JSON documents and highlight the differences.",
    category: "compare",
    family: "json",
    status: "available",
    href: "/tools/json-diff",
    keywords: ["json diff", "compare json", "json compare tool"],
    addedIn: "v1.2",
  },
  {
    id: "text-diff",
    name: "Text Diff",
    tagline: "Line-by-line diff for any two text inputs.",
    category: "compare",
    family: "developer-utilities",
    status: "planned",
    keywords: ["text diff", "compare text online"],
    addedIn: "v1.5",
  },

  // ── Generate ─────────────────────────────────────────────────────────
  {
    id: "fake-json",
    name: "Fake JSON Generator",
    tagline: "Generate realistic mock JSON from a simple shape.",
    category: "generate",
    family: "json",
    status: "available",
    href: "/tools/fake-json",
    keywords: ["fake json", "mock json generator", "random json"],
    addedIn: "v1.3",
  },
  {
    id: "uuid-generator",
    name: "UUID Generator",
    tagline: "Generate v4 UUIDs in bulk, instantly.",
    category: "generate",
    family: "encoding",
    status: "available",
    href: "/tools/uuid",
    keywords: ["uuid generator", "generate uuid v4"],
    addedIn: "v1.3",
  },

  // ── Utilities ────────────────────────────────────────────────────────
  {
    id: "base64",
    name: "Base64 Encode / Decode",
    tagline: "Encode and decode Base64 in the browser.",
    category: "utilities",
    family: "encoding",
    status: "available",
    href: "/tools/base64",
    keywords: ["base64 decode", "base64 encode", "base64 converter"],
    addedIn: "v1.3",
  },
  {
    id: "url-encode",
    name: "URL Encode / Decode",
    tagline: "Percent-encode and decode URL components.",
    category: "utilities",
    family: "encoding",
    status: "available",
    href: "/tools/url-codec",
    keywords: ["url encode", "url decode", "url encoder"],
    addedIn: "v1.3",
  },
  {
    id: "jwt-decoder",
    name: "JWT Decoder",
    tagline: "Decode JWT header, payload, and signature — no verification server.",
    category: "utilities",
    family: "json",
    status: "available",
    href: "/tools/jwt-decoder",
    keywords: ["jwt decoder", "decode jwt", "jwt parser"],
    addedIn: "v1.4",
  },
  {
    id: "timestamp-converter",
    name: "Timestamp Converter",
    tagline: "Convert Unix timestamps to human dates and back.",
    category: "utilities",
    family: "developer-utilities",
    status: "planned",
    keywords: ["unix timestamp converter", "epoch converter"],
    addedIn: "v1.5",
  },

  // ── API (later) ──────────────────────────────────────────────────────
  {
    id: "rest-builder",
    name: "REST Request Builder",
    tagline: "Compose and inspect HTTP requests locally.",
    category: "api",
    family: "networking",
    status: "planned",
    keywords: ["rest client online", "http request builder"],
    addedIn: "v2.0",
  },
  {
    id: "regex-tester",
    name: "Regex Tester",
    tagline: "Test regular expressions with live matches and capture groups.",
    category: "utilities",
    family: "developer-utilities",
    status: "available",
    href: "/tools/regex-tester",
    keywords: ["regex tester", "regular expression tester", "test regex online", "regex match"],
    addedIn: "v1.5",
  },
];

// ── Derived selectors (the only things consumers should import) ────────

export const availableTools: ToolManifest[] = tools.filter((t) => t.status === "available");

export const comingSoon: ToolManifest[] = tools.filter((t) => t.status !== "available");

/** The single featured tool: the flagged one, else the first available. */
export const featuredTool: ToolManifest | undefined =
  tools.find((t) => t.featured && t.status === "available") ?? availableTools[0];

export function getTool(id: string): ToolManifest | undefined {
  return tools.find((t) => t.id === id);
}

export function categoryLabel(id: ToolCategory): string {
  return categories.find((c) => c.id === id)?.label ?? id;
}

export function toolsByCategory(id: ToolCategory): ToolManifest[] {
  return tools.filter((t) => t.category === id);
}

/** Coming-soon/planned tools grouped by category, in category order, empty groups dropped. */
export function comingSoonByCategory(): { meta: CategoryMeta; tools: ToolManifest[] }[] {
  return categories
    .map((meta) => ({
      meta,
      tools: tools.filter((t) => t.category === meta.id && t.status !== "available"),
    }))
    .filter((g) => g.tools.length > 0);
}

export function familyLabel(id: ToolFamily): string {
  return families.find((f) => f.id === id)?.label ?? id;
}

export function toolsByFamily(id: ToolFamily): ToolManifest[] {
  return tools.filter((t) => t.family === id);
}

/** Families with their available tools, in family order, empty families dropped. */
export function familiesWithAvailableTools(): { meta: FamilyMeta; tools: ToolManifest[] }[] {
  return families
    .map((meta) => ({
      meta,
      tools: tools.filter((t) => t.family === meta.id && t.status === "available"),
    }))
    .filter((g) => g.tools.length > 0);
}

/** Headline counts for the catalog/hero stats. */
export const counts = {
  available: availableTools.length,
  comingSoon: comingSoon.length,
  total: tools.length,
};
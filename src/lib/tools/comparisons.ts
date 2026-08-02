/**
 * Comparison pages — "which tool / which format do I pick?" content, one entry
 * per pair. The dynamic route /compare/[slug] generates a page + URL per entry,
 * reading tool names/badges/links from the registry so it never drifts from the
 * catalog. Author an entry to publish its page; the "more comparisons"
 * cross-links appear automatically as entries are added.
 *
 * For format-vs-format comparisons (CSV vs JSON) the sides are formats, not the
 * converter tools — use the optional aLabel/bLabel/aBadge/bBadge/aTag/bTag
 * overrides to name them; they fall back to the registry tool otherwise.
 */
export interface ComparisonAttribute {
  label: string;
  a: string;
  b: string;
}
export interface Comparison {
  slug: string;
  aId: string;
  bId: string;
  /** optional display overrides for format-vs-format comparisons */
  aLabel?: string;
  bLabel?: string;
  aBadge?: string;
  bBadge?: string;
  aTag?: string;
  bTag?: string;
  title: string;
  intro: string;
  useA: { heading: string; points: string[] };
  useB: { heading: string; points: string[] };
  attributes: ComparisonAttribute[];
  verdict: string;
  /** optional honest technical note (shared engine, workflow, caveat…) */
  note?: string;
}

export const COMPARISONS: Record<string, Comparison> = {
  "json-formatter-vs-json-validator": {
    slug: "json-formatter-vs-json-validator",
    aId: "json-formatter",
    bId: "json-validator",
    title: "JSON Formatter vs JSON Validator",
    intro:
      "Both tools parse JSON with the same engine, but they answer different questions. " +
      "The Formatter takes JSON you already trust and makes it readable; the Validator takes " +
      "JSON you don't trust and tells you exactly where it breaks. They're two halves of one " +
      "workflow, not rivals — and everything runs 100% in your browser.",
    useA: {
      heading: "Use the Formatter when",
      points: [
        "You have valid JSON that's cramped or minified and you need to read or edit it.",
        "You want consistent indentation — 2-space, 4-space, or tabs — to match a codebase.",
        "You want to sort object keys alphabetically so diffs stay stable.",
        "You're preparing JSON to paste into a file, a commit, or a colleague's editor.",
      ],
    },
    useB: {
      heading: "Use the Validator when",
      points: [
        "You're not sure the JSON is valid and you want a definitive yes or no.",
        "Something threw a parse error and you need the exact line and column.",
        "You want to catch trailing commas, unquoted keys, and single quotes before they bite.",
        "You want a structure tally and warnings for duplicate keys.",
      ],
    },
    attributes: [
      { label: "Primary job", a: "Make valid JSON readable", b: "Confirm JSON is valid" },
      {
        label: "Changes your data?",
        a: "Re-indents only — data untouched",
        b: "Never — strictly read-only",
      },
      {
        label: "On invalid input",
        a: "Reports the error; won't guess a fix",
        b: "Pinpoints line + column with a caret",
      },
      { label: "Output", a: "Pretty-printed JSON", b: "A diagnostics report" },
      { label: "Sort keys", a: "Yes (optional)", b: "—" },
      { label: "Duplicate-key warnings", a: "—", b: "Yes" },
      { label: "Structure tally", a: "—", b: "Yes — objects, arrays, depth…" },
      { label: "Runs 100% locally", a: "Yes", b: "Yes" },
    ],
    verdict:
      "Format to read it, validate to trust it. In practice you reach for both: validate first " +
      "to catch the error, then format to read the result.",
    note:
      "They share an engine. Both parse your JSON with the same grammar walker, so a document the " +
      "Validator calls valid is one the Formatter can always pretty-print — and a large file runs " +
      "in a background worker in either tool, so the page never freezes.",
  },

  "json-minifier-vs-json-formatter": {
    slug: "json-minifier-vs-json-formatter",
    aId: "json-minifier",
    bId: "json-formatter",
    title: "JSON Minifier vs JSON Formatter",
    intro:
      "These two are the same operation run in opposite directions. The Formatter parses your " +
      "JSON and writes it back out with indentation so a human can read it; the Minifier parses " +
      "it and writes it back out with every bit of whitespace removed so it's as small as possible. " +
      "Same engine, same guarantee that your data is never altered — only the whitespace changes.",
    useA: {
      heading: "Use the Minifier when",
      points: [
        "You want the smallest possible payload for an API response, a request body, or a webhook.",
        "You're embedding JSON in a URL, a bundle, or a config file where whitespace is pure waste.",
        "You care about transfer or storage size and the output is for a machine, not a reader.",
        "You're shipping to production and don't need anyone to read the result by hand.",
      ],
    },
    useB: {
      heading: "Use the Formatter when",
      points: [
        "You have minified or cramped JSON and you need to read, review, or edit it.",
        "You want consistent indentation — 2-space, 4-space, or tabs — to match a codebase.",
        "You want to sort object keys alphabetically so diffs stay stable.",
        "You're preparing JSON to paste into a file, a commit, or a colleague's editor.",
      ],
    },
    attributes: [
      {
        label: "Primary job",
        a: "Strip whitespace to shrink JSON",
        b: "Add whitespace to make JSON readable",
      },
      { label: "Direction", a: "Compress", b: "Expand" },
      { label: "Changes your data?", a: "No — whitespace only", b: "No — whitespace only" },
      { label: "Output size", a: "Smaller", b: "Larger (indented)" },
      {
        label: "Human-readable output",
        a: "No — deliberately compact",
        b: "Yes — that's the point",
      },
      { label: "Sort keys", a: "Yes (optional)", b: "Yes (optional)" },
      { label: "Best for", a: "APIs, URLs, bundles, storage", b: "Editing, reviewing, committing" },
      { label: "Runs 100% locally", a: "Yes", b: "Yes" },
    ],
    verdict:
      "Same engine, opposite directions. Minify to ship it, format to read it — your data is never " +
      "altered, only the whitespace. A common rhythm: format while you're debugging, minify when you deploy.",
    note:
      "Literally the same tool. Minifying is formatting with the indentation set to zero — both parse " +
      "your JSON and re-serialize it, so neither can change your values, and both push large files into " +
      "a background worker so the page never stalls.",
  },

  "json-diff-vs-json-formatter": {
    slug: "json-diff-vs-json-formatter",
    aId: "json-diff",
    bId: "json-formatter",
    title: "JSON Diff vs JSON Formatter",
    intro:
      "Different jobs, same language. The Formatter works on one document and changes how it looks; " +
      "the Diff works on two documents and shows you what changed between them. They answer different " +
      "questions — and in a review workflow you'll often reach for them together.",
    useA: {
      heading: "Use the Diff when",
      points: [
        "You have two versions of a document and need to know exactly what changed.",
        "You're reviewing a config or payload change before it goes out.",
        "You're comparing two API responses — before and after a change, or two endpoints.",
        "You're hunting a regression: something worked before, and you need to see what moved.",
      ],
    },
    useB: {
      heading: "Use the Formatter when",
      points: [
        "You have one document that's cramped or minified and you need to read or edit it.",
        "You want consistent indentation — 2-space, 4-space, or tabs — to match a codebase.",
        "You want to sort object keys alphabetically so future diffs stay stable.",
        "You're preparing JSON to paste into a file, a commit, or a colleague's editor.",
      ],
    },
    attributes: [
      {
        label: "Primary job",
        a: "Show what changed between two documents",
        b: "Make one document readable",
      },
      { label: "Input", a: "Two JSON documents (A and B)", b: "One JSON document" },
      {
        label: "Output",
        a: "Added / removed / changed lines + a similarity score",
        b: "Pretty-printed JSON",
      },
      {
        label: "Changes your data?",
        a: "Never — read-only comparison",
        b: "Re-indents only — data untouched",
      },
      { label: "Sort keys", a: "—", b: "Yes (optional)" },
      { label: "Typical question", a: "What changed?", b: "How should this look?" },
      { label: "Runs 100% locally", a: "Yes", b: "Yes" },
    ],
    verdict:
      "Reach for the Formatter when you have one document and want to read it; reach for the Diff when " +
      "you have two and need to know what changed. A clean review habit: format each version first so " +
      "you're comparing like with like, then diff the two.",
    note:
      "Complementary, not competing. The Formatter never compares and the Diff never rewrites — so a safe " +
      "workflow is to format each version, then diff the two formatted copies and read exactly what moved, " +
      "with no cosmetic noise in the way.",
  },

  "csv-vs-json": {
    slug: "csv-vs-json",
    aId: "csv-to-json",
    bId: "json-to-csv",
    aLabel: "CSV",
    bLabel: "JSON",
    aBadge: "CSV",
    bBadge: "{ }",
    aTag: "Flat, tabular, spreadsheet-native",
    bTag: "Nested, typed, API-native",
    title: "CSV vs JSON",
    intro:
      "CSV and JSON are the two formats you'll move between most. CSV is a flat table — rows and " +
      "columns, one record per line, right at home in a spreadsheet. JSON is a nested tree — objects " +
      "and arrays, able to represent structure CSV simply can't. Neither is better; they're built for " +
      "different jobs, and you'll often convert one into the other.",
    useA: {
      heading: "Use CSV when",
      points: [
        "Your data is flat and tabular — one record per row, a fixed set of columns.",
        "It needs to open cleanly in Excel, Google Sheets, or a database import.",
        "You're moving large, simple datasets where compact size and simplicity win.",
        "You're exchanging data with non-technical tools that expect a spreadsheet.",
      ],
    },
    useB: {
      heading: "Use JSON when",
      points: [
        "Your data is nested or hierarchical — objects inside objects, arrays of records.",
        "It's going to or from an API, a web app, or a config file.",
        "You need real types — numbers, booleans, and nulls, not just text.",
        "Structure matters more than spreadsheet compatibility.",
      ],
    },
    attributes: [
      { label: "Structure", a: "Flat table — rows × columns", b: "Nested tree — objects & arrays" },
      { label: "Represents nesting?", a: "No — a single level", b: "Yes — arbitrarily deep" },
      {
        label: "Data types",
        a: "All text (types inferred)",
        b: "Native — string, number, boolean, null",
      },
      { label: "Schema", a: "Header row defines the columns", b: "Self-describing, per object" },
      {
        label: "Human-readable",
        a: "Yes — especially in a spreadsheet",
        b: "Yes — but verbose when nested",
      },
      { label: "File size", a: "Compact for flat data", b: "Larger — keys repeat per record" },
      {
        label: "Native home",
        a: "Spreadsheets, databases, data tools",
        b: "APIs, config, web apps",
      },
      { label: "Our tool", a: "CSV → JSON converter", b: "JSON → CSV converter" },
    ],
    verdict:
      "Use CSV for flat, tabular data that lives in spreadsheets; use JSON for nested, typed data that " +
      "lives in APIs and code. When you need to cross over, both directions convert locally — CSV → JSON " +
      "to give a table some structure, JSON → CSV to flatten a payload into a spreadsheet.",
    note:
      "Converting is lossy in one direction. JSON → CSV flattens nested structures — arrays and objects " +
      "become columns or serialized cells — so a round trip won't always restore the original. Convert " +
      "CSV → JSON when you want to add structure; convert JSON → CSV when you want a flat table you can " +
      "open anywhere.",
  },
  "json-xml-vs-xml-json": {
    slug: "json-xml-vs-xml-json",
    aId: "json-to-xml",
    bId: "xml-to-json",
    aLabel: "JSON → XML",
    bLabel: "XML → JSON",
    aBadge: "{ }",
    bBadge: "<>",
    aTag: "JSON to XML converter",
    bTag: "XML to JSON converter",
    title: "JSON → XML vs XML → JSON",
    intro:
      "Two sides of the same conversion. JSON → XML takes a JSON object and builds an XML document from it; " +
      "XML → JSON does the reverse, parsing an XML document into a JSON object. Together they let you move " +
      "data between the two most common structured formats on the web — both run 100% locally.",
    useA: {
      heading: "Use JSON → XML when",
      points: [
        "You have JSON data that needs to become an XML feed, an SVG, or a SOAP payload.",
        "You're working with an API that expects XML instead of JSON.",
        "You want to generate structured documents programmatically.",
      ],
    },
    useB: {
      heading: "Use XML → JSON when",
      points: [
        "You have an XML response (RSS, sitemap, SOAP) and want to work with it as JSON.",
        "You need to extract data from an XML document quickly.",
        "You're migrating from XML to JSON and need a parse step.",
      ],
    },
    attributes: [
      { label: "Direction", a: "JSON → XML", b: "XML → JSON" },
      { label: "Input", a: "JSON", b: "XML" },
      { label: "Output", a: "XML", b: "JSON" },
      { label: "Handles attributes?", a: "Yes (configurable)", b: "Yes – prefixed with @" },
      {
        label: "Preserves order?",
        a: "Yes (arrays maintain order)",
        b: "Yes (child order preserved)",
      },
      { label: "Runs 100% locally", a: "Yes", b: "Yes" },
    ],
    verdict:
      "Use JSON → XML when you're generating data for a legacy system; use XML → JSON when you're receiving data from one. They're perfect mirrors, and you'll often use them together in a pipeline.",
    note: "Both conversions are lossless in their own direction. JSON → XML will respect your array order and typed values; XML → JSON will preserve attributes and element order. The reverse of a round‑trip may not be identical if you toggle options (like attributes or array preservation), but the core data remains intact.",
  },
};

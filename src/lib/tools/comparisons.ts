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
  "json-validator-vs-json-schema-lite": {
    slug: "json-validator-vs-json-schema-lite",
    aId: "json-validator",
    bId: "json-schema-lite",
    title: "JSON Validator vs JSON Schema Lite",
    intro:
      "Both look at JSON and tell you if something's wrong — but they're answering different questions. " +
      "The Validator checks the grammar: is this even valid JSON? Schema Lite checks the shape: does this " +
      "valid JSON match the structure I expect? You validate syntax first, then validate against a schema. " +
      "Both run 100% in your browser.",
    useA: {
      heading: "Use the Validator when",
      points: [
        "You're not sure the JSON is syntactically valid and want a definitive yes or no.",
        "Something threw a parse error and you need the exact line and column.",
        "You want to catch trailing commas, unquoted keys, and single quotes before they bite.",
        "You just need to know 'does this parse?' before anything else.",
      ],
    },
    useB: {
      heading: "Use Schema Lite when",
      points: [
        "The JSON parses fine, but you need to confirm it has the fields and types you expect.",
        "You're checking an API response or config against a known shape.",
        "You want to require certain keys and validate their types (string, number, object…).",
        "You're catching 'valid JSON, wrong structure' bugs — the kind a syntax check can't see.",
      ],
    },
    attributes: [
      { label: "Primary job", a: "Confirm JSON is syntactically valid", b: "Confirm JSON matches an expected shape" },
      { label: "Question it answers", a: "'Does this parse?'", b: "'Does this have what I expect?'" },
      { label: "Needs a schema?", a: "No — one input", b: "Yes — JSON + schema" },
      { label: "Catches syntax errors", a: "Yes — exact line + column", b: "No — assumes valid JSON" },
      { label: "Catches missing / wrong-typed fields", a: "No", b: "Yes" },
      { label: "Runs 100% locally", a: "Yes", b: "Yes" },
    ],
    verdict:
      "Validate syntax first, then validate shape. The Validator tells you the JSON parses; Schema Lite " +
      "tells you it's the JSON you were expecting. A payload can pass one and fail the other — valid syntax " +
      "with a missing required field, or the right shape that's one brace short.",
    note:
      "Schema Lite is deliberately a lightweight subset — type checks, required keys, and nested structure — " +
      "not the full JSON Schema spec. It assumes its input is already valid JSON; run the Validator first if " +
      "you're unsure. A full JSON Schema Validator is on the roadmap.",
  },

  "json-diff-vs-text-diff": {
    slug: "json-diff-vs-text-diff",
    aId: "json-diff",
    bId: "text-diff",
    title: "JSON Diff vs Text Diff",
    intro:
      "Both show you what changed between two documents, but they 'see' differently. JSON Diff understands " +
      "structure — it compares keys and values, so a reformatted or re-keyed object doesn't read as a change. " +
      "Text Diff compares line by line, format-agnostic, for any text at all. Pick by what you're comparing: " +
      "structured data or raw text.",
    useA: {
      heading: "Use JSON Diff when",
      points: [
        "You're comparing two JSON documents — configs, payloads, API responses.",
        "You want a semantic diff: key/value changes, not whitespace or key-order noise.",
        "The two versions might be formatted differently but you only care about the data.",
        "You need to spot an added, removed, or changed field in a nested structure.",
      ],
    },
    useB: {
      heading: "Use Text Diff when",
      points: [
        "You're comparing non-JSON text — logs, markdown, code, env files, SQL.",
        "You want a line-by-line diff with additions and removals highlighted.",
        "The format isn't JSON, or you care about the exact lines as written.",
        "You want to ignore case or whitespace differences with a toggle.",
      ],
    },
    attributes: [
      { label: "Primary job", a: "Semantic diff of two JSON documents", b: "Line-by-line diff of any two texts" },
      { label: "Understands", a: "JSON structure — keys, values, nesting", b: "Plain lines, any format" },
      { label: "Whitespace / key-order changes", a: "Ignored — data only", b: "Shown (unless toggled off)" },
      { label: "Works on non-JSON", a: "No — JSON only", b: "Yes — anything textual" },
      { label: "Typical input", a: "Configs, payloads, API responses", b: "Logs, code, markdown, env, SQL" },
      { label: "Runs 100% locally", a: "Yes", b: "Yes" },
    ],
    verdict:
      "If both sides are JSON and you care about the data, use JSON Diff — it won't shout about re-indenting " +
      "or re-ordering keys. For everything else, or when the exact lines matter, use Text Diff.",
    note:
      "A useful habit: if two JSON files diff 'noisy' as text, run them through the Formatter first, or just " +
      "use JSON Diff and let it compare meaning instead of characters.",
  },

  "toml-to-json-vs-json-to-toml": {
    slug: "toml-to-json-vs-json-to-toml",
    aId: "toml-to-json",
    bId: "json-to-toml",
    aLabel: "TOML → JSON",
    bLabel: "JSON → TOML",
    aBadge: "TOML",
    bBadge: "{ }",
    aTag: "TOML to JSON converter",
    bTag: "JSON to TOML converter",
    title: "TOML → JSON vs JSON → TOML",
    intro:
      "Two sides of the same conversion. TOML → JSON parses a TOML config into a JSON object; JSON → TOML " +
      "does the reverse, serializing JSON into clean TOML. Together they let you move data between the " +
      "human-friendly config format and the API-native one — both run 100% locally.",
    useA: {
      heading: "Use TOML → JSON when",
      points: [
        "You have a TOML config (Cargo.toml, pyproject.toml) and need it as JSON.",
        "An API or tool expects JSON but your source is TOML.",
        "You're migrating or bridging a TOML-based project into a JSON pipeline.",
      ],
    },
    useB: {
      heading: "Use JSON → TOML when",
      points: [
        "You have JSON data that needs to become a readable TOML config.",
        "You're generating a config file for a TOML-based toolchain.",
        "You want hand-editable output — TOML is friendlier for humans to tweak.",
      ],
    },
    attributes: [
      { label: "Direction", a: "TOML → JSON", b: "JSON → TOML" },
      { label: "Input", a: "TOML", b: "JSON" },
      { label: "Output", a: "JSON", b: "TOML" },
      { label: "Handles nested tables?", a: "Yes", b: "Yes" },
      { label: "Preserves types?", a: "Yes — dates, numbers, booleans", b: "Yes — within TOML's types" },
      { label: "Runs 100% locally", a: "Yes", b: "Yes" },
    ],
    verdict:
      "Use TOML → JSON when you're consuming a config; use JSON → TOML when you're producing one. They're " +
      "mirrors, and you'll often use both when bridging a TOML project and a JSON API.",
    note:
      "Powered by the same TOML engine (smol-toml) in both directions, so a round trip preserves the core " +
      "data. TOML's richer date/time types map to strings in JSON, so a round trip may normalize those.",
  },

  "yaml-to-json-vs-json-to-yaml": {
    slug: "yaml-to-json-vs-json-to-yaml",
    aId: "yaml-to-json",
    bId: "json-to-yaml",
    aLabel: "YAML → JSON",
    bLabel: "JSON → YAML",
    aBadge: "YAML",
    bBadge: "{ }",
    aTag: "YAML to JSON converter",
    bTag: "JSON to YAML converter",
    title: "YAML → JSON vs JSON → YAML",
    intro:
      "Two sides of the same conversion. YAML → JSON parses a YAML document into JSON; JSON → YAML does the " +
      "reverse, serializing JSON into readable YAML. Since YAML is a superset of JSON, the two formats are " +
      "close cousins — and these tools move you between them, both running 100% locally.",
    useA: {
      heading: "Use YAML → JSON when",
      points: [
        "You have a YAML config (CI pipelines, Kubernetes, docker-compose) and need it as JSON.",
        "An API or tool expects JSON but your source is YAML.",
        "You want to inspect or process a YAML document with JSON tooling.",
      ],
    },
    useB: {
      heading: "Use JSON → YAML when",
      points: [
        "You have JSON that should become a hand-editable YAML config.",
        "You're writing or updating a YAML file and starting from JSON data.",
        "You want cleaner, less-bracketed output for humans to read and tweak.",
      ],
    },
    attributes: [
      { label: "Direction", a: "YAML → JSON", b: "JSON → YAML" },
      { label: "Input", a: "YAML", b: "JSON" },
      { label: "Output", a: "JSON", b: "YAML" },
      { label: "Handles nesting & lists?", a: "Yes", b: "Yes" },
      { label: "Comments", a: "Dropped (JSON can't hold them)", b: "Not generated" },
      { label: "Runs 100% locally", a: "Yes", b: "Yes" },
    ],
    verdict:
      "Use YAML → JSON when you're consuming a config; use JSON → YAML when you're writing one. They're " +
      "mirrors — and because YAML is a superset of JSON, the crossing is usually lossless for plain data.",
    note:
      "One honest caveat: YAML comments and some YAML-specific features (anchors, tags) don't survive into " +
      "JSON, so a round trip may simplify those. Plain data — strings, numbers, booleans, lists, objects — " +
      "round-trips cleanly.",
  },

  "csv-to-tsv-vs-tsv-to-csv": {
    slug: "csv-to-tsv-vs-tsv-to-csv",
    aId: "csv-to-tsv",
    bId: "tsv-to-csv",
    aLabel: "CSV → TSV",
    bLabel: "TSV → CSV",
    aBadge: "CSV",
    bBadge: "TSV",
    aTag: "Comma-separated values",
    bTag: "Tab-separated values",
    title: "CSV → TSV vs TSV → CSV",
    intro:
      "Same tabular data, different delimiter. CSV separates fields with commas; TSV separates them with " +
      "tabs. These two tools swap one for the other — nothing more, nothing less. Pick by which delimiter " +
      "your destination expects.",
    useA: {
      heading: "Use CSV → TSV when",
      points: [
        "A tool or pipeline expects tab-separated input but you have a CSV file.",
        "Your fields contain commas, and tabs would avoid the quoting headaches.",
        "You're moving a spreadsheet export into a TSV-based system.",
      ],
    },
    useB: {
      heading: "Use TSV → CSV when",
      points: [
        "A tool or spreadsheet expects comma-separated input but you have TSV.",
        "You need the more universally recognized CSV format.",
        "You're preparing tab-separated data for a CSV-based import.",
      ],
    },
    attributes: [
      { label: "Direction", a: "CSV → TSV", b: "TSV → CSV" },
      { label: "Input delimiter", a: "Comma", b: "Tab" },
      { label: "Output delimiter", a: "Tab", b: "Comma" },
      { label: "Header row preserved?", a: "Yes", b: "Yes" },
      { label: "Quoted fields handled?", a: "Yes — RFC 4180 parsing", b: "Yes — RFC 4180 output" },
      { label: "Runs 100% locally", a: "Yes", b: "Yes" },
    ],
    verdict:
      "They're the same operation pointed in opposite directions — use whichever matches the direction you're " +
      "converting. If your data has commas in fields, TSV is often the calmer format; if you need broad " +
      "compatibility, CSV is the safer destination.",
    note:
      "One honest caveat: CSV → TSV is the lossy direction if a field contains an embedded newline — TSV " +
      "can't keep it in one cell, so the converter refuses by default (with an escape option). TSV → CSV is " +
      "always lossless because CSV quoting can hold anything.",
  },

  "base64-vs-url-encode": {
    slug: "base64-vs-url-encode",
    aId: "base64",
    bId: "url-encode",
    title: "Base64 vs URL Encode",
    intro:
      "Both turn data into safe-to-transmit text, but they solve different problems. Base64 re-encodes binary " +
      "or text into a compact ASCII alphabet so it survives transports that only carry text. URL encoding " +
      "(percent-encoding) escapes the handful of characters that aren't allowed in a URL. One is for payloads; " +
      "the other is for URLs.",
    useA: {
      heading: "Use Base64 when",
      points: [
        "You need to embed binary data (an image, a file) in text — a data URI, a JSON field, an email.",
        "You're encoding a payload so it survives a text-only transport intact.",
        "You're decoding a Base64 string back to its original bytes or text.",
      ],
    },
    useB: {
      heading: "Use URL Encode when",
      points: [
        "You're putting a value into a URL — a query string or path segment.",
        "You need to escape spaces, &, ?, =, and other reserved characters.",
        "You're building or reading query parameters and need them to round-trip safely.",
      ],
    },
    attributes: [
      { label: "Primary job", a: "Encode binary/text as ASCII text", b: "Escape characters for URLs" },
      { label: "Typical use", a: "Embedding payloads, data URIs", b: "Query strings, URL segments" },
      { label: "Output", a: "Base64 alphabet (A–Z, a–z, 0–9, +, /)", b: "Percent-escaped (%20, %26…)" },
      { label: "Reversible?", a: "Yes — lossless decode", b: "Yes — lossless decode" },
      { label: "Handles binary?", a: "Yes — that's the point", b: "Byte-level, but meant for text" },
      { label: "Runs 100% locally", a: "Yes", b: "Yes" },
    ],
    verdict:
      "If the data is going *into* a URL, URL-encode it. If the data needs to *be* text (a binary blob in a " +
      "text field), Base64 it. They often appear together: a Base64 payload can still need URL-encoding if " +
      "you then put it in a query string.",
    note:
      "Neither is encryption — both are trivially reversible encodings, not protection. If you're Base64-ing " +
      "something sensitive, it's still readable to anyone who decodes it.",
  },
};

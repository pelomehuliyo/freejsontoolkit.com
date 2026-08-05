## [v1.5.7] — Timestamp Converter

### Added
- **Timestamp Converter** (`/tools/timestamp-converter`) — convert Unix timestamps to human
  dates and back, in seconds, milliseconds, microseconds, and nanoseconds. Timestamp → Date
  shows the instant in your local time and UTC (plus day-of-year, ISO week, and relative time);
  Date → Timestamp accepts local ISO, UTC (Z), RFC/HTTP, and bare dates and reports the value in
  every unit at once. A live clock and a one-click "use current time" fill the input with now.
- Registry entry (utilities category, developer-utilities family), relations edges, and sitemap line.
- Full docs entry with runnable snippets and examples.

### Notes
- Runs entirely on the browser's native Date engine — no worker needed, fully offline.


## [1.3.1] - 2026-08-01

Discoverability & Product Polish — the sprint that turned ten live tools from
"ten pages" into one connected product. Every addition below is shared
infrastructure, so each future tool inherits it for free.

### Added

- **Global command palette** (`⌘K` / `Ctrl+K`, and `/` off the catalog): instant
  fuzzy search across tools and categories, full keyboard navigation, curated
  search aliases (e.g. `prettify` → Formatter, `guid` → UUID), and recent tools
  surfaced as history — styled as the toolkit's own console shell. _(bite 1)_
- **Catalog search** upgrades: a live match count and an entrance animation on
  newly-matched cards, sharing the palette's alias-aware matching. _(bite 1)_
- **Relationship graph** (`relations.ts`) and a server-rendered **"Related tools —
  where to next"** rail on every tool page, so no tool dead-ends. _(bite 2)_
- **Per-tool documentation engine** (`ToolDocs` + `docs.ts`): a living lead
  artifact (error anatomy / before-after), a common-errors accordion whose
  snippets fire straight into the tool, runnable examples, a sticky "on this page"
  scroll-spy rail, and a graph-driven "pair this with" line. Authored in full for
  the JSON Validator and JSON Formatter. _(bite 3)_
- **Comparison pages**: a dynamic `/compare/[slug]` route plus a `/compare` hub,
  with four authored comparisons (Formatter vs Validator, Minifier vs Formatter,
  Diff vs Formatter, CSV vs JSON) — each its own SEO-targeted URL with a
  face-to-face hero, a "when to use which" split, an attribute table, a verdict,
  and automatic cross-linking. _(bite 4)_
- **On-tool "Compare" chip row** (`CompareLinks`) and a global footer
  **"Compare tools"** link, so the comparison network is discoverable from inside
  the product, not just by URL. _(bite 4)_
- **Tool intelligence** (`ToolNudge`): a contextual, output-aware coach bar that
  appears the moment a tool produces a result and suggests the next step from the
  relationship graph (e.g. Formatter → "validate it?"), with a smart
  "looks tabular → convert to CSV" promotion; dismissible and remembered per
  session. _(bite 5)_
- **Homepage overhaul**: `/` rebuilt from a static landing into a console-style
  developer directory — a live local-sandbox readout, registry-driven featured
  tools, category browse, a popular row, personalized favorites + recently-used,
  the pipeline, and the trust band — composing every prior layer. _(bite 6)_

### Changed

- Favorites and recents now resolve tools by route (`href`) as well as `id`, so
  tools whose id differs from their URL (UUID, URL codec) are remembered
  correctly. _(bite 2)_
- **"Load sample" loads only** and no longer auto-runs the tool, across the
  Formatter, CSV→JSON, Validator, Minifier, Base64, and URL codec — explicit
  control over when a transform runs.

### Fixed

- Restored the favorites / recents memory layer after a malformed HTML comment
  (`*/` instead of `-->`) swallowed the registry data island in the layout head,
  which had silently disabled starring, the "Your tools" row, recents, and the
  catalog live-count. _(bite 2)_
- Equal-height editor alignment globalized into the shared stylesheet so the
  input/output editors line up on **every** tool page, not just the first.
- Documentation scroll-spy now tracks the section at the top of the viewport
  deterministically (and smooth-scrolls with a click-lock), so the active
  "on this page" marker matches the clicked entry and survives window resizes.
  _(bite 3)_

  ## [1.3.0] - 2026-08-01

The cadence release — five utilities that took the catalog from five to ten live
tools, each built almost entirely from the shared editor / workspace / worker /
registry substrate (the "new tool = mostly wiring" thesis, proven).

### Added

- **JSON Minifier** — strip whitespace to a single line, with a live before/after/saved
  compression readout; reuses the Validator's engine for exact error coordinates.
- **Base64 Encode / Decode** — standard + URL-safe alphabets, padding toggle,
  `data:`-URI wrapping, and a magic-byte sniffer that names decoded payloads
  (PNG / JPEG / PDF / JSON / …).
- **UUID Generator** — v1, v4, v5, and v7 in bulk, with a sortable-order check,
  four output formats, and a version legend as the documentation.
- **Fake JSON Generator** — template-driven faker tokens with a seeded,
  reproducible PRNG and a live "shape" strip.
- **URL Encode / Decode** — component / whole-URL / form modes with a live
  percent-encoding footprint and byte-accurate readouts.

## [v1.4] — 2026-08-02

### Added

- **YAML → JSON converter** (`/tools/yaml-to-json`) — parses YAML 1.2, outputs
  pretty-printed JSON with exact line/col error reporting; large files convert
  in a background worker. Duplicate keys are rejected (not silently dropped);
  comments, anchors, and timestamps handled explicitly.
- Docs entry for YAML → JSON (error examples + runnable snippets).
- Relations edges for `json-to-yaml` and `yaml-to-json` (related rail, nudge,
  compare chips now fire for the full YAML pair).

### Fixed

- `relations.ts`: removed duplicate `"json-to-xml"` key (the second entry was
  silently discarding the "Or flatten to CSV" edge).
- `relations.ts`: replaced the `"json-to-csv" in {} ? "" : "json-to-csv"`
  expression with a plain string id.

### Registry

- `yaml-to-json` flipped to `status: "available"` — catalog, footer, palette,
  homepage directory, and sitemap all derive from this one entry.


## [v1.5.0] — Collections: browse by what you're doing

### Added
- **Collections** — a mental-model layer over the catalog. Every tool now declares a
  `family` (the user's "I need to work with JSON" grouping), distinct from its
  operational `category`.
- `/collections` hub plus one permanent page per family (`/collections/[family]`),
  each with a crafted empty state for shelves still filling up — no dead routes.
- Homepage "Browse by collection" strip above the category directory.
- Command-palette **Collections** group: shelves surface at idle and match on search,
  each with its own badge.
- Registry island now carries `family` + `familyLabel`, so any client-built surface
  can group by family.

### Changed
- Registry: added `ToolFamily` type, `families` meta array, and the
  `familyLabel` / `toolsByFamily` / `familiesWithAvailableTools` selectors.
- Footer: Resources column gains a "Collections" link.
- Sitemap: `/collections` + one entry per family.

### Families seeded
- **JSON**, **Encoding**, and **Developer Utilities** render as live shelves;
  **Data Formats** and **Networking** are reserved and light up as their tools ship
  (Data Formats fills when CSV ⇄ TSV lands).


## [v1.5.1] — Regex Tester

### Added
- **Regex Tester** (`/tools/regex-tester`) — live match highlighting (a DOM-built
  `<mark>` render, never `innerHTML`), a match list with numbered and named capture
  groups, live flag toggles (g i m s u y), and a replace preview with `$1` / `$&`.
  Runs on the browser's native `RegExp` — no worker (bounded + live-by-nature).
- Registry entry (developer-utilities family), relations edges, and sitemap line.
- **Two-input docs loader** — a cooperative contract so Regex doc snippets fire into
  both inputs: `ToolDocs` announces the load via a cancellable `fjt:docs-load` event
  (single-input tools don't listen, so they're untouched); the Regex page intercepts,
  splits line 1 = pattern / rest = test text, fills both inputs, and flashes them.




  ## [v1.5.2] — CSV ⇄ TSV

### Added
- **CSV → TSV converter** (`/tools/csv-to-tsv`) — quoted fields handled by the shared RFC 4180
  parser; the lossy direction is honest: cells with an embedded newline are refused by default
  with line/col, with an explicit "escape to \n" option to force.
- **TSV → CSV converter** (`/tools/tsv-to-csv`) — lossless; output gets proper RFC 4180 quoting
  (fields with comma/quote/newline are quoted, quotes doubled).
- **`src/lib/csv/csvSerializer.ts`** — the write-side twin of the existing CSV parser, so all
  CSV/TSV output quotes from a single source of truth (compounds for any future delimiter tool).
- Registry entries (data-formats family), relations edges, and sitemap lines for both tools.

### Deferred
- Docs for both converters — the two-behavior "load into tool" mechanic needs a decision before
  shipping a load button (component renders nothing until then; safe).



  ## [v1.5.3] — TOML → JSON

### Added
- **TOML → JSON converter** (`/tools/toml-to-json`) — parses TOML configs into clean JSON,
  powered by `smol-toml` (the first deliberate external dependency: tiny, fast, TS-native,
  worker-safe).
- Registry entry (data-formats family), relations edges, and sitemap line.

### Notes
- Heavy parses run in the worker; Load Sample stays load-only per the house rule.
- Docs deferred to a fast-follow (same load-snippet decision as CSV ⇄ TSV).


## [v1.5.4] — JSON → TOML

### Added
- **JSON → TOML converter** (`/tools/json-to-toml`) — serialize JSON into clean TOML,
  powered by `smol-toml` (the toolkit's external TOML dep: tiny, fast, TS-native,
  worker-safe).
- Registry entry (data-formats family), relations edges, and sitemap line.

### Notes
- Heavy serializations run in the worker; Load Sample stays load-only per the house rule.
- Docs deferred to a fast-follow (same load-snippet decision as the other converters).


## [v1.5.5] — Text Diff

### Added
- **Text Diff** (`/tools/text-diff`) — line-by-line diff for any two text inputs
  (logs, configs, code, markdown, env files, SQL); added / removed / changed lines
  highlighted, with a similarity readout. Heavy diffs run in a worker.
- Registry entry flipped to `available` (compare family), relations edges (pairs
  with JSON Diff), and sitemap line.

### Deferred
- Docs to a fast-follow (same load-snippet decision as the other new converters).



## [v1.5.6] — JSON Schema Lite

### Added
- **JSON Schema Lite** (`/tools/json-schema-lite`) — validate a JSON document against a
  lightweight schema (type checks, required keys, nested structure), fully offline, with
  errors reported by path. Deliberately *lite* and honest about it: it covers the fast,
  readable core of schema validation and says so, leaving the full JSON Schema spec to the
  v2.0 validator rather than half-implementing it.
- Registry entry (validate category, JSON family), relations edges, and sitemap line.

### Notes
- Heavy validations run in a worker; Load Sample stays load-only per the house rule.
- Docs deferred to a fast-follow (same load-snippet decision as the other new tools).
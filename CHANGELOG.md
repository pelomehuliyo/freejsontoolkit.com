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

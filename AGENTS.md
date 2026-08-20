## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Tool page contracts

Every tool page must satisfy these contracts. A tool page never ships with
any one of them missing.

### Page structure contract

- **Single-input tools** use `ToolShell` → `ToolHeader` →
  `ToolWorkspace layout="3-col"` (input slot, `.ws-fill`, controls slot,
  output slot, `.ws-fill`, `.ws-output`).
- **Two-input tools** use the `dj-stage` layout: `ToolShell` → `ToolHeader` →
  custom stage (two input cards, controls card, output card). Never force a
  two-input tool into the 3-col `ToolWorkspace`.

Required page sections after the workspace/stage, in order:

1. how-it-works section
2. `ToolDocs`
3. `CompareLinks`
4. `RelatedTools`
5. `ToolNudge`
6. `FAQ`

### Tool header contract

Every tool page header (`ToolHeader` in `src/components/tools/ToolHeader.astro`)
has exactly three parts: **breadcrumbs**, **title**, **subtitle**. No tool page
may ship without all three.

**Breadcrumbs** — Standard pattern is `Home → Tool Name`, e.g.
`[{ label: "Home", href: "/" }, { label: "JSON Formatter" }]`. If a tool
belongs to a collection and the design already supports collection
breadcrumbs, keep that consistent. Never invent a third breadcrumb style.

**Subtitle** — One clear sentence explaining what the tool does. Rules:

- One sentence, plain and factual. No marketing fluff.
- No privacy claims. The privacy notice rendered inside `ToolHeader` owns
  that — never repeat "offline", "100% local", "without leaving your
  browser", or "never uploaded" in the subtitle.

Good tone:

> Unix time to a human date, and any date back to Unix time — in seconds, ms, µs or ns.

Avoid:

> The best free online timestamp tool with blazing fast conversion.

### Input / output contract

Every input editor must have: a `textarea` with id `<editorId>-textarea`, a
visible label, a placeholder, an info/status bar, and a character count where
useful. After any programmatic value change, dispatch
`textarea.dispatchEvent(new Event("editor-refresh"));`.

Output editors are `readonly`, labelled, with placeholder and a status/count
bar. Output never contains fake or example content unless the user explicitly
generated it.

**Input status language** — use these states where applicable:

- `Status: Empty`
- `Status: Ready`
- `Status: Invalid`
- Large-file mode: `Status: Large file ready` (or similar — short, consistent).

**Output status language** — use these states where applicable:

- `Output: Empty`
- `Output: Ready`
- `Output: Preview`
- `Output: Error`
- Large-file mode: `Output: Preview — N rows × M cols · Download for the full file`
  (or `Output: Preview — first N of M records · Download for the full file`).

Where the result has a type name, `Output: Date`, `Output: Timestamp`,
`Output: JSON`, or `Output: Diff` is acceptable, but the pattern must stay
consistent within each tool category.

### Button and action contract

The primary button uses the tool's real verb. Never use `Submit`, `Execute`,
or `Go`.

Preferred verbs: `Convert`, `Format`, `Minify`, `Validate`, `Compare`,
`Generate`, `Encode`, `Decode`, `Test`.

| Tool                | Verb            |
| ------------------- | --------------- |
| JSON Formatter      | Format          |
| JSON Minifier       | Minify          |
| JSON Validator      | Validate        |
| JSON Diff           | Compare         |
| Text Diff           | Compare         |
| UUID Generator      | Generate        |
| Fake JSON Generator | Generate        |
| Base64              | Encode / Decode |
| URL Encode/Decode   | Encode / Decode |
| JWT Decoder         | Decode          |
| Regex Tester        | Test            |
| Timestamp Converter | Convert         |
| CSV → JSON          | Convert         |
| CSV → TSV           | Convert         |
| TSV → CSV           | Convert         |

Busy state uses the same verb plus ellipsis — `Converting…`, `Formatting…`,
`Validating…`, `Comparing…`, `Generating…`, `Decoding…`, `Testing…` — never a
label swap (e.g. a Convert button must not turn into "Cancel").

**Input actions** — standard order: `Load Sample`, then `Clear`. If space is
tight, icon/label treatment may vary, but the order stays the same.

**Output actions** — standard order: `Copy`, then `Download`. If the tool has
no downloadable result, omit Download. If the tool is in large-file preview
mode, copy must warn: "Copy copies only the preview — use Download for the
full file."

### Load Sample rule

`Load Sample` loads only. It never auto-runs. The only tolerated historical
exception is `fake-json`.

### Keyboard contract

Every tool page supports `Ctrl/Cmd + Enter` → primary action (the tool's real
verb). The handler skips when the target is a `SELECT` (the existing house
pattern). No tool-specific shortcuts unless documented and consistent. Never
bind `Ctrl/Cmd + S`, `Ctrl/Cmd + P`, or `Ctrl/Cmd + W` — they conflict with
browser behavior. `Escape` belongs to global overlays/palette only
(`CommandPalette`, `Header` drawer), never individual tool-run logic.

### No dead ends

Every tool page must give the user somewhere to go next: `RelatedTools`,
`CompareLinks`, `ToolDocs`, `FAQ`, collection/family context, or a `ToolNudge`.

### Clear behavior

`Clear` must remove: input, output/result, error, and large-file state. It must
preserve: mode, units, and options — unless an option is meaningless after
clearing. `Clear` must revoke any active large-file Blob URLs and drop the
stored Blob reference.

### Non-negotiable house rules

- **Copy:** User-facing prose avoids em dashes. Rewrite with commas, colons,
  or periods. This rule targets editorial copy (heroes, ledes, subtitles,
  FAQs, docs, comparisons, articles, marketing/legal pages). It never applies
  to tool runtime strings ("Output: Preview — first N rows"), placeholder
  values, aria-labels, meta title/description separators, or code comments.
- **Privacy:** No data leaves the browser. No backend performs conversions. No
  analytics/tracking is added during quality passes. Large-file mode reads and
  converts files locally. Any copy that mentions privacy stays truthful.
- **Product:** No separate JSON Beautifier / Pretty Print tool. Do not split
  JSON Schema Lite and JSON Schema Validator into two tools. No dark mode —
  yet. The primary button's white-on-teal brand decision is frozen. Add no new
  dependencies during quality passes. Do not edit `BaseLayout.astro` unless
  explicitly instructed. Do not remove the related rail, docs, compare links,
  nudge, or FAQ sections.

## Hardcore e2e testing

Every tool page is covered by Playwright end-to-end specs in `tests/`.
This is a working contract, not a wishlist: it must be green before the
corresponding work is done.

### When it applies

A per-tool spec is **required** whenever a tool page or its runtime
behavior changes: new tool, new option, layout change, keyboard handler,
large-file mode, or a fix to conversion logic. Pure content changes
(learn articles, docs, copy) are covered by the smoke suite and do not
require a new spec.

### The mandate

- One spec file per tool: `tests/<tool-id>.spec.ts`.
- The spec is written in the same change as the tool work and is green
  before the change is considered done.
- Reuse helpers in `tests/helpers.ts`. If one does not exist yet, extract
  the shared logic there when the first spec needs it.
- The smoke suite in `tests/smoke.spec.ts` stays: every tool page loads
  with breadcrumbs, title, subtitle, workspace, and the six required
  sections.

### The eight suites

Cover each tool spec with these suites:

1. **Load**: page renders, sections in order, no console errors.
2. **Load Sample**: fills input, never auto-runs, primary verb shown.
3. **Primary action**: real verb triggers, output status moves
   `Empty → Ready`, busy state shows verb plus ellipsis.
4. **Clear**: removes input, output, error, and large-file state;
   preserves mode, units, and options.
5. **Keyboard**: `Ctrl/Cmd + Enter` runs the primary action; skipped on
   a focused `SELECT`.
6. **Copy/Download**: copy writes the output to the clipboard; download
   produces a file. Large-file preview mode warns that copy is preview-only.
7. **Invalid input**: error banner shows `<id>-message`, status reads
   `Invalid` or `Output: Error`, and no fake output is produced.
8. **Large file** (where supported): drag-drop and file input both drive
   preview + download, cancel aborts, and Blob URLs are revoked on Clear.

### Selectors

Specs use the stable DOM contract, never class names or snapshot
positions: `<id>-textarea`, `<id>-gutter`, `<id>-dropzone`,
`<id>-file-input`, `<id>-status`, `<id>-message`, `<id>-close`,
`<x>-announce`, `[data-action="sample|clear|copy|download"]`, and the
tool's actual primary-button id. The contract must match the DOM, so
specs target the id each page really ships:

| Tool                | Primary button id |
| ------------------- | ----------------- |
| JSON Formatter      | `#format-btn`     |
| JSON Minifier       | `#minify-btn`     |
| JSON Validator      | `#validate-btn`   |
| JSON to CSV         | `#convert-btn`    |
| UUID Generator      | `#uu-generate`    |
| HMAC Generator      | `#hmac-run`       |

If a new tool page does not follow the `#<verb>-btn` shape used by the
converters, document its real id here instead of pretending otherwise.

### Test hooks

State stores may expose a dev-only hook (the `window.__jsonToCsvStore`
pattern) so specs can await a known state instead of sleeping. The hook
is gated behind an `import.meta.env.DEV` check and never ships in
production builds.

### The gate

A tool change ships only when all of these pass locally:

```
npm run e2e
npm test
npx astro check
npm run lint
npm run build
```

CI (`.github/workflows/playwright.yml`) re-runs the same e2e suite on
every push, so a green local run plus a push is the full proof.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

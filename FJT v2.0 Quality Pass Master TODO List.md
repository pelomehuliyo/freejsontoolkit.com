# FJT v2.0 Quality Pass — Master TODO List

**Sprint Track**: Tool Quality Pass  
**Post-Polish Track (Locked)**: Hashing & Security  
**Goal**: Make all 23 tools feel like one disciplined instrument.

---

## 1. Non-Negotiables & House Rules

### Privacy Rules
- [ ] Ensure no data leaves the browser across all tools.
- [ ] Ensure no backend service is used for tool processing or conversion.
- [ ] Do not add any analytics or tracking scripts during this quality pass.
- [ ] Verify large-file mode continues reading and converting files 100% locally.
- [ ] Ensure all privacy copy and notices remain 100% truthful.

### Product Rules
- [ ] Maintain single JSON Formatter (do NOT create separate JSON Beautifier / Pretty Print tool).
- [ ] Maintain single JSON Schema Validator (do NOT split JSON Schema Lite and JSON Schema Validator into two tools).
- [ ] Keep dark mode disabled / unstarted for this sprint.
- [ ] Preserve white-on-teal primary button brand styling decision.
- [ ] Add zero new external dependencies during the quality pass.
- [ ] Do not edit `BaseLayout.astro` unless explicitly instructed.
- [ ] Preserve all trailing section components on tool pages: `RelatedTools`, `CompareLinks`, `ToolDocs`, `ToolNudge`, and `FAQ`.

### Load Sample Rule
- [ ] Enforce load-only behavior for `Load Sample` (never auto-runs upon loading).
  - *Exception*: `fake-json` (if historical auto-run is already established).

### No Dead Ends Rule
- [ ] Ensure every tool page provides next-step actions via:
  - [ ] Related tools links
  - [ ] Compare links
  - [ ] Tool documentation (`ToolDocs`)
  - [ ] FAQ section
  - [ ] Collection / family navigation
  - [ ] Next action nudge (`ToolNudge`)

---

## 2. Page Structure Contract

### Single-Input Tools Layout
- [ ] Enforce wrapper: `ToolShell` → `ToolHeader` → `ToolWorkspace layout="3-col"`
  - [ ] Input slot with `.ws-fill`
  - [ ] Controls slot
  - [ ] Output slot with `.ws-fill .ws-output`
- [ ] Required post-workspace page section order:
  1. [ ] how-it-works section
  2. [ ] `ToolDocs`
  3. [ ] `CompareLinks`
  4. [ ] `RelatedTools`
  5. [ ] `ToolNudge`
  6. [ ] `FAQ`

### Two-Input Tools Layout (`dj-stage`)
- [ ] Enforce wrapper: `ToolShell` → `ToolHeader` → custom `dj-stage` section
  - [ ] Two input cards
  - [ ] Controls card
  - [ ] Output card
- [ ] Do NOT force two-input tools into 3-col `ToolWorkspace`.
- [ ] Required post-stage page section order:
  1. [ ] how-it-works section
  2. [ ] `ToolDocs`
  3. [ ] `CompareLinks`
  4. [ ] `RelatedTools`
  5. [ ] `ToolNudge`
  6. [ ] `FAQ`

---

## 3. Header Contract

- [ ] Every tool header must include all 3 parts: **breadcrumbs**, **title**, **subtitle**.
- [ ] **Breadcrumbs**:
  - [ ] Enforce standard pattern: `Home → Tool Name`
  - [ ] Preserve existing collection breadcrumbs if already supported; do not invent a 3rd style.
- [ ] **Subtitle**:
  - [ ] Exactly one clear sentence explaining the tool's function.
  - [ ] No marketing fluff ("blazing fast", "best online", etc.).
  - [ ] Omit privacy claims in subtitle unless necessary (privacy notice in `ToolHeader` owns that statement).

---

## 4. Input & Output Contract

### Input Editor
- [ ] Attach dropzone ID: `<editorId>-dropzone`
- [ ] Provide visible `<label>`
- [ ] Provide descriptive `placeholder`
- [ ] Include info / status bar
- [ ] Include character count where useful
- [ ] Dispatch event on programmatic updates: `textarea.dispatchEvent(new Event("editor-refresh"))`

### Output Editor
- [ ] Set editor to `readonly`
- [ ] Provide visible `<label>`
- [ ] Provide descriptive `placeholder`
- [ ] Include status / count bar
- [ ] Ensure output never displays fake or example content unless explicitly triggered by user.

### Input Status Language
- [ ] Standardize status states:
  - [ ] `Status: Empty`
  - [ ] `Status: Ready`
  - [ ] `Status: Invalid`
  - [ ] `Status: Large file ready` (or short, consistent equivalent for large files)

### Output Status Language
- [ ] Standardize status states:
  - [ ] `Output: Empty`
  - [ ] `Output: Ready`
  - [ ] `Output: Preview`
  - [ ] `Output: Error`
  - [ ] `Output: Preview — N rows × M cols · Download for full file` (large-file mode)
  - [ ] Consistent type-specific status if applicable (`Output: Date`, `Output: Timestamp`, `Output: JSON`, `Output: Diff`).

---

## 5. Button & Action Contract

### Primary Action Verbs
- [ ] Remove non-compliant primary verbs (`Submit`, `Execute`, `Go`).
- [ ] Use explicit tool verbs:
  - [ ] JSON Formatter → `Format`
  - [ ] JSON Minifier → `Minify`
  - [ ] JSON Validator → `Validate`
  - [ ] JSON Diff → `Compare`
  - [ ] Text Diff → `Compare`
  - [ ] UUID Generator → `Generate`
  - [ ] Fake JSON Generator → `Generate`
  - [ ] Base64 → `Encode` / `Decode` (depending on active mode)
  - [ ] URL Encode/Decode → `Encode` / `Decode` (depending on active mode)
  - [ ] JWT Decoder → `Decode`
  - [ ] Regex Tester → `Test`
  - [ ] Timestamp Converter → `Convert`
  - [ ] CSV → JSON → `Convert`
  - [ ] CSV → TSV → `Convert`
  - [ ] TSV → CSV → `Convert`
- [ ] Standardize busy state labels using `Verb + …` (never swap label text to "Cancel"):
  - [ ] `Converting…`
  - [ ] `Formatting…`
  - [ ] `Validating…`
  - [ ] `Comparing…`
  - [ ] `Generating…`
  - [ ] `Decoding…`
  - [ ] `Testing…`

### Action Button Order
- [ ] **Input Actions**: `Load Sample` first, then `Clear`.
- [ ] **Output Actions**: `Copy` first, then `Download` (omit `Download` if tool produces no file output).
- [ ] **Large-File Copy Warning**: Display warning when copying preview:  
  *"Copy copies only the preview — use Download for the full file."*

### Clear Behavior
- [ ] Ensure `Clear` resets:
  - [ ] Input content
  - [ ] Output / result content
  - [ ] Error messages
  - [ ] Large-file state & cached data
- [ ] Ensure `Clear` preserves:
  - [ ] Active mode selection
  - [ ] Units selection
  - [ ] Options & settings (unless meaningless after clearing)
- [ ] Revoke active Blob URLs on clear execution.

---

## 6. Options Contract

### Visual Language
- [ ] Format option labels: `mono`, `uppercase` or `tracked`, `small`, `muted`.
- [ ] Control selections:
  - [ ] Segmented buttons for exclusive options
  - [ ] Toggles / checkboxes for boolean options
  - [ ] `<select>` elements only for long/numerous option lists

### Disabled States
- [ ] Use true programmatic disablement (`control.disabled = true`).
- [ ] If intentional focus retention is needed, use `control.setAttribute("aria-disabled", "true")`.
- [ ] Do NOT rely solely on visual CSS opacity or `pointer-events: none`.

### Option Modifications
- [ ] Recompute live for fast synchronous tools.
- [ ] Require explicit run / mark stale state for heavy tools.
- [ ] Ensure large-file mode does not silently keep old results when options change (prompt: *"Options changed — convert again"* or auto re-run if original file buffer is retained).

---

## 7. Keyboard Contract

- [ ] Support `Ctrl/Cmd + Enter` → triggers primary action across all tools.
- [ ] Skip keyboard trigger when active focus target is a `<select>` element.
- [ ] Do NOT register tool-specific shortcuts unless explicitly documented & consistent.
- [ ] Do NOT capture browser native hotkeys: `Ctrl/Cmd + S`, `Ctrl/Cmd + P`, `Ctrl/Cmd + W`.
- [ ] Restrict `Escape` key handling to global overlays / command palette only.

---

## 8. Web Worker Contract

### Synchronous Bounded Tools (No Worker)
- [ ] Maintain synchronous execution for light tools:
  - `uuid-generator`
  - `base64`
  - `url-encode`
  - `regex-tester` (within safe limits)
  - `timestamp-converter`

### Heavy Tools (Worker Required)
- [ ] Ensure worker execution for heavy operations:
  - `json` formatter / minifier / validator
  - Diff engines
  - CSV / YAML / XML / TOML converters
  - Schema validation
  - Large-file mode

### Worker Staleness Guard
- [ ] Implement request sequence counter (`let reqId = 0`).
- [ ] Verify `e.data.id === currentReqId` in `worker.onmessage` prior to updating UI.
- [ ] Maintain separate request counter for large-file mode (`let largeReqId = 0`).

### Worker Cancellation & State Safety
- [ ] Ensure new run supersedes pending run.
- [ ] Ensure `Clear` action invalidates pending worker requests.
- [ ] Ignore stale worker messages.
- [ ] Prevent UI from getting trapped in `running` state.

---

## 9. Large-File Contract

*Target Tools*: `csv-to-json`, `csv-to-tsv`, `tsv-to-csv`

### Threshold & Streaming
- [ ] Enforce `LARGE_FILE_THRESHOLD_BYTES = 15_000_000` (15 MB).
- [ ] Files exceeding threshold must not be loaded as a single main-thread string.

### Processing Phases
- [ ] Display calm, visible phase progression: `reading` → `converting` → `preparing` → `done`.
- [ ] Avoid fake animation / artificially delayed progress theater.

### Preview Rules
- [ ] Enforce preview cap: `PREVIEW_CHARS = 100_000`.
- [ ] CSV/TSV conversions: truncate preview strictly at the last complete row.
- [ ] CSV → JSON: output valid truncated JSON array.
- [ ] Never render an empty array (`[]`) when data exists but no single record fits into limit.
- [ ] Clearly display `previewExceeded` state.

### File Handling & Blob Safety
- [ ] Provide full result exclusively as a local file download.
- [ ] Warn user on copy that only the preview is copied.
- [ ] Revoke existing Blob URLs:
  - [ ] Before creating a new Blob URL
  - [ ] Before executing `Clear`
  - [ ] Before replacing an output result
- [ ] Maintain honest limits messaging ("Memory is the only ceiling.", "Preview is capped.", "Download contains full result.", "Nothing is uploaded.").

---

## 10. Error Handling Contract

- [ ] Standardize error text: specific, calm, actionable, non-blaming.
- [ ] Include detailed contextual coordinates where available (line, column, cell, row, JSON Pointer path, missing field, expected token).
- [ ] Use standard `ErrorBanner` component: `banner.show(message)` / `banner.hide()`.
- [ ] Do NOT use browser native `alert()`.
- [ ] Do NOT expose raw stack traces in main UI (collapsible detail allowed).
- [ ] Announce errors politely to screen readers: `announce("Error: " + message)` (do not announce every keypress).

---

## 11. Copy & Download Contract

### Copy Behavior
- [ ] Standard mode: Copy full output string.
- [ ] Large-file mode: Copy preview string only + display warning.
- [ ] Standardize success message: `"Output copied"` or `"Copied"` across all tools.

### Download Naming & MIME Standards
- [ ] Standardize output download file names:
  - `converted.json`
  - `converted.csv`
  - `converted.tsv`
  - `formatted.json`
  - `minified.json`
  - `diff.txt`
  - `validation-report.txt`
  - `uuids.txt`
  - `base64-output.txt`
  - `url-output.txt`
  - `jwt-payload.json`
  - `timestamp-converted.txt`
- [ ] Standardize MIME types:
  - `application/json;charset=utf-8`
  - `text/csv;charset=utf-8`
  - `text/tab-separated-values;charset=utf-8`
  - `text/plain;charset=utf-8`

---

## 12. Tool Documentation Contract (`ToolDocs`)

- [ ] Ensure docs are registered for every tool using the **registry ID** (e.g. registry ID `json-schema-validator` for route `/tools/json-schema-lite`).
- [ ] Include required sections:
  - [ ] Eyebrow label
  - [ ] Concept title
  - [ ] Concept explanation (direct, factual, technical — no marketing tone)
  - [ ] Common errors / items to know
  - [ ] Runnable code examples
- [ ] Snippet behavior:
  - [ ] Single-input tools: load snippet directly into main input editor.
  - [ ] Two-input tools: adhere strictly to cooperative docs-load contract.

---

## 13. FAQ Contract

- [ ] Include core mandatory questions:
  - [ ] Is my data uploaded?
  - [ ] What input formats are accepted?
  - [ ] What happens if the input is invalid?
  - [ ] What are the limits?
  - [ ] What should I do next?
- [ ] Include large-file specific FAQ entries where applicable:
  - [ ] Can it handle large files?
  - [ ] What happens to the full result?
  - [ ] Why is the output preview capped?

---

## 14. SEO & Metadata Contract

- [ ] **Title Tag Pattern**: `Tool Name — Primary Keyword / Benefit (Free, Local)`
  - *Example*: `Timestamp Converter — Unix Timestamp to Date & Back (Free, Local)`
- [ ] **Meta Description Pattern**: `Free online [tool]. [Main action]. [Important units/options]. 100% local, no upload.`
- [ ] **Registry Keywords**: Include primary term, reverse term, "online", tool type ("converter"/"tester"/"generator"), and large-file terms where relevant.

---

## 15. Relations & Internal Linking Contract

- [ ] Ensure 2–4 relation edges per tool page.
- [ ] Include at least one natural next step link and one sibling/pair link.
- [ ] Use verb-led labels (`Validate it`, `Format the result`, `Reverse it`, `Compare versions`, `Encode the result`, `Generate sample data`).
- [ ] Maintain reciprocal pairs for converters:
  - [ ] `CSV → JSON` ↔ `JSON → CSV`
  - [ ] `CSV → TSV` ↔ `TSV → CSV`
  - [ ] `TOML → JSON` ↔ `JSON → TOML`
  - [ ] `YAML → JSON` ↔ `JSON → YAML`
  - [ ] `XML → JSON` ↔ `JSON → XML`
- [ ] Strengthen internal links on `text-diff`.

---

## 16. Accessibility & Performance Contracts

### Accessibility
- [ ] Ensure visible focus states across interactive elements.
- [ ] Link visible `<label>` to every input element.
- [ ] Provide `aria-label` for icon-only buttons.
- [ ] Apply `aria-pressed` on toggles / segmented buttons.
- [ ] Provide polite live region updates for status messages.
- [ ] Eliminate keyboard traps.
- [ ] Respect `prefers-reduced-motion` in custom CSS / JS animations.
- [ ] Keep white-on-teal primary button contrast exception intact.

### Performance
- [ ] Debounce live inputs.
- [ ] Cap input sizes and preview lengths.
- [ ] Use Web Workers for heavy tasks.
- [ ] Prevent addition of unneeded external libraries, tracking scripts, or framework islands.

---

## 17. Documented Known Exceptions (Do NOT "Fix")

- [1] `Load Sample` is load-only, except historical `fake-json` if already implemented with auto-run.
- [2] Primary button white-on-teal contrast is an approved brand exception.
- [3] JSON Schema Lite registry ID / route mismatch: registry ID is `json-schema-validator`, route is `/tools/json-schema-lite`.
- [4] Two-input tools do not use 3-col `ToolWorkspace` (they use `dj-stage`).
- [5] Large-file copy is preview-only by design.
- [6] `CSV → JSON` large-file mode skips `colCount`.
- [7] Networking family shelf exists in collection/sitemap as intentional empty shelf.
- [8] Dark mode is intentionally deferred.

---

## 18. Per-Tool Audit Checklist (Execute for All 23 Tools)

- [ ] Title/description follow standard pattern
- [ ] Breadcrumbs and header follow contract
- [ ] Input editor IDs and `editor-refresh` event handler match contract
- [ ] Output editor is `readonly` with appropriate placeholder
- [ ] Empty states are clear and factual
- [ ] `Load Sample` loads only (no auto-run)
- [ ] `Clear` resets input, output, errors, and Blob URLs while preserving options
- [ ] `Copy` behaves correctly with standard success toast
- [ ] `Download` uses standardized filename and MIME type
- [ ] Primary button uses real tool verb
- [ ] Busy label uses `Verb…` pattern
- [ ] `Ctrl/Cmd + Enter` triggers primary action
- [ ] Option controls are accessible with true programmatically disabled states
- [ ] `ErrorBanner` is used correctly with `.show()` / `.hide()`
- [ ] Status bar / dot state is consistent
- [ ] Web worker staleness guard exists where required
- [ ] `RelatedTools` section renders with verb-led labels
- [ ] `CompareLinks` section renders where relevant
- [ ] `ToolDocs` renders with valid registry ID key
- [ ] `ToolNudge` renders expected next action
- [ ] `FAQ` answers mandatory questions
- [ ] No dead-end layout after result rendering
- [ ] Reduced motion media query respected
- [ ] No browser console errors or unnecessary logs

### Extra Checklist Items for Large-File Ready Tools
- [ ] `LARGE_FILE_THRESHOLD_BYTES` (15 MB) triggers worker mode
- [ ] File picker and drag-drop dropzone both observe threshold limit
- [ ] Phase sequence (`reading` → `converting` → `preparing` → `done`) is visible
- [ ] Preview capped at `PREVIEW_CHARS` (100,000)
- [ ] Full output downloadable locally
- [ ] Copy action warns preview-only status
- [ ] Blob URLs revoked on clear, replacement, or re-run
- [ ] Option changes invalidate stale results cleanly

---

## 19. Quality Pass Execution Phases

### Phase 1: Golden Audit
- [ ] Audit Golden Single-Input Candidate: `json-validator`
- [ ] Audit Golden Two-Input Candidate: `text-diff` or `json-schema-lite`
- [ ] Audit Golden Large-File Candidate: `csv-to-json`

### Phase 2: Read-Only Audit
- [ ] Run prompt-driven read-only consistency audit across all tools.
- [ ] Produce audit findings report (no code modifications).

### Phase 3: Review Findings
- [ ] Categorize findings:
  - [ ] Safe mechanical fixes
  - [ ] Needs decision
  - [ ] Do not change (intentional exceptions)

### Phase 4: Apply Approved Fixes
- [ ] Apply approved consistency fixes strictly within specified file boundaries.

### Phase 5: Manual Verification
- [ ] Perform UI and functional checks on screen for updated tools.

### Phase 6: Audit Quartet Verification
- [ ] Run `npm run lint`
- [ ] Run `npm run format:check`
- [ ] Run `npm test`
- [ ] Run `npm run build`

### Phase 7: Tag Release
- [ ] Tag release commit (e.g. `v2.0.0-polish.1` or final `v2.0.0`).

---

## 20. Post-Polish Sprint Preview: Hashing & Security Track (Locked)

- [ ] **Track Setup**: `Family: Hashing & Security` | `ID: hashing` | `Label: Hashing & Security`
- [ ] **Wave 1 Targets**: `SHA-256`, `SHA-512`, `HMAC`
- [ ] **Wave 2 Targets**: `MD5` (marked legacy/insecure), `bcrypt` (worker/performance tuned)
- [ ] **Implementation Stance**: Use WebCrypto API where possible, worker-safe hashing, local-only key input, honest security notices.

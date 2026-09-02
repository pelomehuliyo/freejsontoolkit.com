# TODO — Fix Hero Bounce: `Format, validate, convert. Without uploading a byte.` Scroll-Past Exit

> **Goal:** Reduce homepage hero bounce (heatmap scroll-past + immediate exit) by fixing psychological value/trust/choice failures, not code performance.
> **Site identity:** `Free JSON Toolkit` — 28 tools — 100% local, 0 bytes uploaded (`README.md:3`, `src/pages/index.astro:62`, `src/lib/tools/registry.ts:107`)
> **Heatmap diagnosis:** 3-second test failed — `Is this for me? Is it safe? What do I click?` not answered concretely above the fold.
> **Execution:** Do items in order — one at a time, check the box only after verification passes. Do not batch.
> **House rules locked:** No em dashes in editorial copy (`AGENTS.md:158`), privacy claim only in `ToolHeader` pill + micro-trust row (`AGENTS.md:45`), no new deps, no `BaseLayout.astro` edit, primary button white-on-teal `#21a78a` frozen (`AGENTS.md:166`).

**How to use:** Work top to bottom. Each item has **Builder Action** (non-technical, in your website builder text layers) + **Dev Handoff** (file:line for junior dev) + **Acceptance** + **Verify**. Mark `- [x]` only when Verify passes.

---

## Phase 0 — Setup & Baseline (Do First)

- [ ] **0.1 Create branch + baseline screenshot**
  - Builder: Screenshot current hero at 1440px + 390px (iPhone) — save as `docs/before-hero.png`
  - Dev: `git checkout -b fix/hero-bounce` | `git status`
  - Files: `src/pages/index.astro:68-158` hero region
  - Acceptance: Branch exists, screenshot saved to `docs/`
  - Verify: `git branch --show-current` == `fix/hero-bounce`

- [ ] **0.2 Record baseline heatmap numbers (7 days)**
  - Builder: In Hotjar/Clarity/PostHog note: % scroll past hero, hero CTA CTR (`Browse the toolkit` `index.astro:112`), avg time to first click, search `⌘K` opens (`CommandPalette.astro:50`)
  - Acceptance: Numbers written in `docs/baseline.md`
  - Verify: Numbers exist, dated.

- [ ] **0.3 Run 5-second user test (no code)**
  - Show current hero 5s to 2 people who never saw site. Hide, ask: `What does it do? Who is it for? What do you click?`
  - Expected fail now: `28 tools?` / `format what?` — write answers down.
  - Acceptance: Test notes saved.
  - Dependency: 0.1

---

## Phase 1 — P0 Hero Copy & Trust (Highest impact — Do This Week)

- [ ] **1.1 Rewrite H1 — `src/pages/index.astro:76-79`**
  - Builder Action: Double-click hero H1, delete `Format, validate, convert. / Without uploading a byte.` Paste:
    ```
    Paste the messy JSON.
    Get clean, readable data — nothing leaves your browser.
    ```
    Keep line break, keep second line teal `.hp-accent` `#16725e` (`index.astro:657`).
  - Alt A/B to test later (do not use now): `Drop any JSON or CSV — formatted instantly, 100% on your device.` / `Fix broken JSON in one click. Your data never leaves this tab.`
  - Dev Handoff: `src/pages/index.astro:76-79` `<h1 class="hp-h1 display-xl">` — 2 lines, first line object `JSON`, second line outcome + privacy suffix.
  - Why: Fixes Reason #1 (abstract verbs) + #3 (split promise). Adds object + outcome.
  - Acceptance: H1 contains `JSON` + verb `Paste/Get` + `nothing leaves` as suffix, not headline.
  - Verify: Preview at 1440/390, no wrap on `Get clean`, contrast pass `#171717` on `#fff`.
  - Risk: No em dash — use period, not `—` (house rule).
  - Edge: Long H1 on mobile — test `390px` does not push CTA below fold.

- [ ] **1.2 Rewrite Lede — `src/pages/index.astro:80-82`**
  - Builder: Subtitle block under H1, delete `A growing suite...in a worker when it's heavy...` Paste:
    ```
    For API responses, CSV exports, and tokens you can't risk uploading. Paste, click once, copy or download — works offline after it loads.
    ```
  - Dev: `src/pages/index.astro:80-82` `<p class="hp-lede body-lg">` `max-width 52ch` (`index.astro:660`)
  - Why: Fixes Reason #2 (jargon) + #4 (no persona). Names 3 concrete jobs from `registry.ts:112,170,514`.
  - Acceptance: One paragraph, names `API / CSV / tokens`, no `worker`/`single-purpose`.
  - Verify: Read aloud — no stumble.

- [ ] **1.3 Rewrite Kicker — `src/pages/index.astro:72-74`**
  - Builder: Eyebrow `FREE JSON TOOLKIT · 28 TOOLS · 100% LOCAL` → `FREE FOR 28 TASKS · PASTE → FIX → COPY · 100% IN YOUR BROWSER`
  - Alt: `28 TOOLS · 0 UPLOADS · 0 ACCOUNTS · PASTE AND GO`
  - Dev: `src/pages/index.astro:72-74` `<p class="hp-kicker caption-mono"><span class="hp-kicker-dot">`
  - Acceptance: Kicker is benefit ladder, not inventory.
  - Verify: Dot pulse still visible.

- [ ] **1.4 Fix Hero CTAs — `src/pages/index.astro:112-118`**
  - Builder: Button group — Change Primary `Browse the toolkit` (`Button variant=primary` `Button.astro:71`) → `Try it now — paste JSON` Link `href="/tools/json-formatter"` (or `#hp-demo` after 1.6). Change Secondary `Why local?` → text link `See why nothing is uploaded →` → `/why-local` OR hide secondary if space tight. Keep one primary + one ghost only.
  - Dev: `src/pages/index.astro:112-118` `Button href="#hp-directory"` + `Button href="/why-local"`
  - Why: Fixes choice split. Uses real verb `Try/Format` per `AGENTS.md:91`.
  - Acceptance: One dominant CTA, label starts with verb, points to runnable tool.
  - Verify: Tab order primary first.

- [ ] **1.5 Remove hero quickstats — `src/pages/index.astro:103-109`**
  - Builder: Delete row `28 live · ★ 0 saved · ↩ 0 recent · 0 B uploaded` from hero. Do not delete code — hide in builder or move to footer trust ledger (`index.astro:408-424`).
  - Dev: `src/pages/index.astro:103-109` `<div class="hp-quickstats">` 4 stats
  - Why: Fixes empty social proof + eerie 0 B before action.
  - Acceptance: Hero has zero `0 saved/0 recent` visible.
  - Dependency: 1.4

- [ ] **1.6 Add micro-trust row under CTA — `src/pages/index.astro:112` below buttons**
  - Builder: Insert new 12px `caption-mono` row, pill style like `ToolHeader.astro:95` `privacy-notice` `border hairline radius 6px padding 4px 16px inline-flex gap xs` + lock SVG 14px. Text:
    ```
    [lock] Nothing uploaded  ·  [spark] Works offline  ·  [github] Open source · GitHub ★
    ```
    Copy from `why-local.astro:200-207` guarantees condensed. Link `Open source` → `https://github.com/pelomehuliyo/freejsontoolkit.com`
  - Dev: New `div.hp-micro-trust` below CTAs, before `hp-console`.
  - Why: Verifiable proof without 5× repetition.
  - Acceptance: Row visible at 390px, 3 items, no duplicate sentence.
  - Verify: Links work.

- [ ] **1.7 Replace console HUD with live demo — `src/pages/index.astro:123-155`**
  - Builder: Right column `hp-console` dark card `#171717` `aria-hidden` → Replace with static before/after mini demo (fake, no logic needed):
    ```
    BEFORE (minified): {"users":[{"id":1,"name":"..."}]}
         → [Format] →
    AFTER (readable):  {
                         "users": [{ "id": 1 ... }]
                       }
    Caption: Paste yours above — same one-click result.
    ```
    Style: `background: #171717`, `mono 13px`, arrow teal `#21a78a`. Use artifact copy from `ToolDocs.astro:620-628` `before-after` lead.
  - Dev Handoff: `src/pages/index.astro:123-155` `.hp-console` + `.hp-hero-grid 1.08fr 0.92fr` (`index.astro:627`) — keep grid, swap content. Optional later: embed real `json-formatter` widget.
  - Why: Decorative HUD → concrete proof, 3-sec gratification + moves buried `ToolDocs` proof up.
  - Acceptance: Demo readable at 959px stack.
  - Verify: No `aria-hidden` contains focusable violation.
  - Risk: If real widget, must dispatch `editor-refresh` (`CodeEditor.astro:130`) — keep fake for P0.

---

## Phase 2 — P1 Choice Overload Reduction (Same Sprint)

- [ ] **2.1 Collapse 4 browse strips into 1 — `src/pages/index.astro:161-345`**
  - Builder: Hide `hp-personal` `Starred & waiting / Recently used` `161-182` (show only if `localStorage fjt:favorites/recents` `BaseLayout.astro:510` has >0, else hide). Hide `hp-popular` `Most-reached-for` `184-211`. Hide `hp-collections` `What are you working on?` `213-238`. **Keep only** `hp-directory` `Browse by category` `290-345` 2-col grid (`tool-grid minmax 248px` `tool-cards.css:3`). Change title `Browse by category` → `Browse by what you're fixing` or `What needs fixing?` Keep subtitle `Every tool shares one editor...` `295-297`.
  - Dev: Comment out sections or `hidden` attribute, do not delete — easy revert.
  - Why: Hick's Law 4 navs → 1.
  - Acceptance: Homepage has 1 catalog grid max 8 visible + `Show all 28 →` → `/tools`.
  - Verify: At 959px grid stacks 1 col.

- [ ] **2.2 Move full trust ledger down — `src/pages/index.astro:393-427`**
  - Builder: Move section `The promise · Nothing you paste ever leaves this tab.` `397-398` + `guarantees.txt` ledger `408-424` + `See live proof →` `404` **below** catalog, not immediate after hero. Keep anchor `id="hp-trust"`.
  - Dev: Cut `hp-trust` block and paste after `hp-directory`, before `hp-pipeline`.
  - Acceptance: Trust still one click away from micro-trust row via link.
  - Dependency: 1.6 + 2.1

- [ ] **2.3 Insert social proof block where trust was — `src/pages/index.astro:393`**
  - Builder: Insert new section after catalog, before comparisons. Eyebrow `TRUSTED · VERIFIED` Title `Loved on GitHub, built in the open` Grid 3 cols (`RelatedTools.astro:106` `repeat auto-fill minmax 220px`):
    - Card 1: `★ 1.2k GitHub stars` (fetch build-time or hardcode) + `Updated May 2026 · v1.7.0` (`package.json: version`)
    - Card 2: Quote `“Finally a formatter that doesn’t phone home”` — dev quote (GitHub Discussion) + `— via GitHub`
    - Card 3: `0 outbound requests since load` (clone live counter from `why-local.astro:46-68` or static `0` with caption `Open DevTools → Network, filter Fetch/XHR` `why-local.astro:59`)
  - Dev: New `section.hp-social-proof` `background var(--color-canvas-soft) #fafafa` `border-top hairline`
  - Why: Replaces repetitive privacy with third-party validation.
  - Acceptance: 3 cards visible.
  - Verify: At 959px stacks.

---

## Phase 3 — P2 Empty-State & Click Cost (Tool Pages — 1 Day)

- [ ] **3.1 Rewrite input/output banners — all `src/pages/tools/*.astro` + `src/components/tools/CodeEditor.astro:50-96`**
  - Builder: For each tool, text layers inside `CodeEditor` slots:
    - Input bar `Status: Empty · 0 chars` `json-formatter.astro:50` → `Drop JSON here — we’ll show readable output in one click` · `0 chars` muted 11px
    - Output bar `Output: Empty` `json-formatter.astro:113` → `Your result appears here — copy or download, 100% offline` OR after run `Output: Ready — 1,240 lines formatted`
  - Dev: Centralize in `CodeEditor.astro:50-96` `ee-value` + `editor-info-bar` slots OR edit each tool page info bars (`json-formatter:50,113`, `csv-to-json:123,127`, `base64:384` etc). Keep dispatch `textarea.dispatchEvent(new Event("editor-refresh"))` (`CodeEditor.astro:130`).
  - Why: Empty meter vs invitation.
  - Acceptance: No `Status: Empty` visible on load.
  - Verify: `Status: Invalid` still shows on parse error.

- [ ] **3.2 Fix Load Sample expectation — `src/components/tools/ToolActions.astro:38-43`**
  - Builder: Next to `Load Sample` button add 11px muted `caption` `color var(--color-mute)`:
    ```
    Loads example — then hit Format →
    ```
    Arrow pulses toward primary verb (`#format-btn` `json-formatter:86`, `#validate-btn`, `#convert-btn:98`, `#run-btn:117` `base64`). Do NOT auto-run (respects `AGENTS.md:129`, `fake-json.astro:30` excepted).
  - Dev: Add `span.sample-hint` inside `ToolActions variant="inset"` or per page `json-formatter:39` actions `["sample","clear"]` container.
  - Why: Load ≠ Run confusion.
  - Acceptance: Hint visible on desktop.
  - Verify: Click `Load Sample` → input fills + hint arrow animates 2s.

- [ ] **3.3 Deduplicate privacy on tool pages — `ToolHeader.astro:95-113`**
  - Builder: Keep only Header pill `Your data is processed entirely in your browser and is never uploaded.` `ToolHeader.astro:113` + Footer `Footer.astro:76`. Change Controls `Local sandbox active` `json-formatter:95` → functional `Ready — 0 records detected` (or `Ready — paste to start`). Keep empty trust `local sandbox · 0 bytes uploaded` `CodeEditor.astro:94` but dim `opacity .6`. Keep FAQ Q1 `Is my data uploaded?` collapsed.
  - Dev: Edit `src/pages/tools/*.astro` controls `status-banner` text per tool.
  - Why: 5× repetition → 2 max.
  - Acceptance: Tool page shows max 2 privacy claims above fold.

---

## Phase 4 — P3 Visual Hierarchy & Polish (Half Day)

- [ ] **4.1 Make primary button unmissable — `src/components/Button.astro:71` + `ToolWorkspace.astro:68`**
  - Builder: Set controls card `position: sticky top 88px` (`BaseLayout Header 64px` + gap). Increase primary button `size=lg 48px` full-width `width:100%` `Button.astro:64`, keep teal `#21a78a` hover `#1b8971` active `#16725e`. Add `→` in label `Format →`.
  - Dev: `src/pages/tools/*.astro` controls `Button #format-btn/#convert-btn` `size="lg"` + `class="action-btn"` `width:100%`.
  - Why: 280px center loses to 650px editors.
  - Acceptance: Button visible while scrolling editor.

- [ ] **4.2 Fix SHA-256 order bug — `src/pages/tools/sha-256.astro:129-135`**
  - Builder: Move `HowItWorks` `how it works` above `ToolDocs` (currently last). Must match contract `AGENTS.md:25-32` 1.HowItWorks 2.ToolDocs 3.CompareLinks 4.RelatedTools 5.ToolNudge 6.FAQ.
  - Dev: Cut `HowItWorks` from `L135` and paste before `ToolDocs L129`.
  - Acceptance: Order matches `json-formatter.astro:121-212`.
  - Verify: `npm run e2e` smoke spec section-order passes.

- [ ] **4.3 Add freshness cue — `src/pages/index.astro:72` + `Footer.astro:102`**
  - Builder: Kicker or footer line `Updated May 2026 · v1.7 · 28 live + 1 pipeline` from `registry.ts:740 counts` + `package.json: version`.
  - Why: Recency.
  - Acceptance: Date visible.

---

## Phase 5 — Verification Gate (Must Be Green Before Merge)

- [ ] **5.1 Builder preview checks**
  - [ ] 5-sec test with 2 new people passes — write answers.
  - [ ] Mobile thumb: hero CTA reachable at 667px without scroll.
  - [ ] No em dashes in H1/lede `AGENTS.md:158` — search `—` in hero copy = 0.
  - [ ] Accessibility: Tab hero CTA, focus ring `outline 3px var(--color-accent)` `global.css:391` visible.

- [ ] **5.2 Dev checks (run locally)**
  - [ ] `npx astro check`
  - [ ] `npm run lint`
  - [ ] `npm test` (Vitest)
  - [ ] `npm run build` (generates `sw` via `scripts/generate-sw.mjs`)
  - [ ] `npm run e2e` — must include `tests/smoke.spec.ts` (breadcrumbs, title, subtitle, workspace, 6 sections order) + per-tool specs.

- [ ] **5.3 Heatmap re-measure (7 days post-publish)**
  - [ ] Scroll-past hero ↓ 30%+
  - [ ] Hero CTA CTR ↑ vs `Browse the toolkit` baseline.
  - [ ] Time to first interaction ↓ to <4s.
  - [ ] Tool page: `Load Sample` → `Format` conversion ↑.

- [ ] **5.4 Rollback criteria**
  - If bounce ↑ or CTR ↓ after 7 days, revert `index.astro:76-79` H1 to original and keep micro-trust row — single variable revert.

---

## Clarifying Questions — Answer Before 1.1 to Lock Copy

1. Primary traffic: `json formatter` vs `csv to json` vs GitHub/direct? If CSV-heavy, H1 must include `CSV`.
2. Primary loser if they bounce: devs (privacy) vs analysts (speed)? Drives H1 suffix.
3. Homepage goal: `Tool use` vs `Browse catalog` vs `Learn trust`? Pick one primary CTA — we chose `Tool use`.
4. Language: English-native? If no, avoid `messy` → `broken / unformatted`.
5. Can we show GitHub stars/real quote? If no number, use `Open source · No tracking` only.

---

## Dev File Map (Single Source of Truth)

Homepage: `src/pages/index.astro:52-58` guarantees, `61-64` SEO, `68-158` hero, `161-500` sections, `609-1700` styles.
Tool shell: `src/components/tools/ToolHeader.astro:57-116` breadcrumbs/title/subtitle/pill, `ToolShell.astro:34`, `ToolWorkspace.astro:68` `1fr 280px 1fr`, `CodeEditor.astro:54-101` gutter/empty, `ToolActions.astro:38` registry, `Button.astro:71` teal.
Content: `src/lib/tools/registry.ts:107-744` tools, `docs.ts:39` docs, `relations.ts:20`, `comparisons.ts:38`, `faq.ts:13`, `learn/articles.ts:35`.
Layouts: `src/layouts/BaseLayout.astro:64-267` GA deferred + palette, `Header.astro:19-80`, `Footer.astro:45-107`, `global.css:14-32` tokens, `tool-cards.css:986-1046` HUD.

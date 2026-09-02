# Baseline — 2026-09-02 — Before Hero Fix (Phase 0)

Branch: `fix/hero-bounce` (created 2026-09-02)

## Heatmap numbers to fill (7 days before)
- % scroll past hero without clicking: _ (Hotjar/Clarity)
- Hero CTA CTR (Browse the toolkit): _ %
- Avg time to first click: _ s
- Search opens (⌘K /): _ per session
- Bounce rate homepage: _ %
- Screenshot files: `docs/baseline/before-hero-desktop.png` + `before-hero-mobile.png` (take manually at 1440px and 390px, hero  src/pages/index.astro:68-158)

## Current hero copy (before)
- Kicker `index.astro:72-74`: FREE JSON TOOLKIT · 28 TOOLS · 100% LOCAL
- H1 `index.astro:76-79`: Format, validate, convert. / Without uploading a byte.
- Lede `index.astro:80-82`: A growing suite of single-purpose tools for JSON, CSV and more. Everything runs in your browser, in a worker when it's heavy, with nothing sent anywhere.
- Quickstats `index.astro:103-109`: 28 live · 0 saved · 0 recent · 0 B uploaded
- CTAs `index.astro:112-118`: Browse the toolkit (#hp-directory) + Why local? (/why-local)

## 5-agent synthesis — Top 3 selected for Phase 1 P0
Agents hired in parallel (value, trust, choice overload, social proof, actionability). Top 3 consensus implemented:

1. **Value clarity (Agent1 #1+#2)**: H1 → `Paste broken JSON, get clean valid code in seconds. Nothing you paste ever leaves your browser.` + Lede → `Formatter, validator, JSON to CSV, Base64 and 24 more. Paste, convert, copy. No signup, no upload, free forever.` + Kicker → `{counts.available} FREE TOOLS · PASTE → FIX → COPY · ZERO BYTES UPLOADED` — fixes abstract verbs / jargon.
2. **Trust verifiable (Agent2 #1 + Agent4 #1)**: New micro-trust row `Open source · Verify: DevTools → Network stays at 0 · Works offline after load` between lede and searchbar (`index.astro:84`) + quickstats fix `live tools / Open source on GitHub / Updated Sep 1, 2026 / 0 B uploaded by design` — fixes over-justification and zero-state eeriness.
3. **Actionability (Agent1 #3 + Agent5 #2)**: CTAs `Try JSON Formatter now` (/tools/json-formatter, primary) + `Browse all tools` (#hp-directory, secondary) + hint `One click demo, no upload needed. See before and after in 2 seconds.` — fixes Hick's Law browse vs do.

Deferred to Phase 2/3: collapse 4 browse strips→1, social proof block, Load Sample hint — will be implemented in Phase 2 P1 after Phase 1 verification gate.

## Verification after Phase 1 (to fill 7 days after)
- Scroll-past hero ↓ 30%+ ?
- Hero CTA CTR ↑ ?
- Time to first click ↓ to <4s ?
- Search opens ↓ on homepage ?
- 5-sec test passes (paste broken JSON → get clean) ?

## How to verify Phase 1 locally
```
npx astro check
npm run lint
npm test
npm run build
npm run e2e
```
All must be green before merge (AGENTS.md:246-253).

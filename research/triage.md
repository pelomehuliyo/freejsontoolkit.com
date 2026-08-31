# SEO & Content Triage

## Completed
- [x] SHA-512 (3 Learn Articles, Tool FAQs)
- [x] SHA-256 (3 Learn Articles, Tool FAQs)
- [x] Security Comparison Pages (SHA vs SHA, SHA vs bcrypt, etc.)
- [x] MD5 — 4 Learn Articles (what-is-md5, is-md5-secure, how-to-check-md5, can-md5-be-decrypted) + 2 new (how-does-md5-work, how-to-get-md5-hash-of-file) + 2 comparisons (md5-vs-sha-512, md5-vs-bcrypt) + registry 4→8 (md5 hash generator, get md5 hash of file etc.) + FAQ sync — 2026-08-31 (9a9a958)
- [x] JSON → XML / XML → JSON — registry json-to-xml 7→18 + xml-to-json 2→14 from research/keywords/keywords-for-json-to-xml.csv (json to xml 5k, xml to json 50k) + 3 Learn (how-to-convert-json-to-xml, json-vs-xml, how-to-convert-xml-to-json) — 2026-08-31 (9a9a958)
- [x] UUID Generator — 6 Learn (what-is-a-uuid, uuid-v4-vs-v5, can-uuids-collide, how-to-generate-a-uuid + what-is-uuid-v7, uuid-format-and-examples) + 2 comparisons (uuid-v4-vs-v7, uuid-v1-vs-v4) + registry 2→34 (uuid 500k, random uuid 50k, uuid4 generator 500k, javascript/python/java/golang 5k) from research/keywords/uuid.csv — 2026-08-31 (1424354, 2e09a63)
- [x] bcrypt — 4 Learn (what-is-bcrypt, how-does-bcrypt-work, is-bcrypt-secure + how-to-hash-password-with-bcrypt) + registry 12→24 (bcrypt 50k, bcrypt python/js 5k) from research/keywords/bcrypt.csv — 2026-08-31 (1234742)
- [x] HMAC — 4 Learn (what-is-hmac, hmac-vs-sha-256, how-to-generate-hmac-sha256, is-hmac-secure) + registry 3→20 (hmac 50k, hash based message authentication code 50k, hmac sha256 online 5k) from research/keywords/hmac.csv — 2026-08-31 (f99c529)
- [x] Base64 — 1 Learn (what-is-base64) + registry 6→19 (base64 500k, b64 decode 50k, base64 python/js 5k) from research/keywords/base64.csv — 2026-08-31 (d2d7768)
- [x] Timestamp Converter — 1 Learn (what-is-unix-timestamp) + registry 6→20 (unix timestamp converter 500k, timestamp converter 50k, convert epoch 500k) from research/keywords/timestamp-converter.csv — 2026-08-31 (d2d7768)
- [x] Text Diff — 1 Learn (how-to-compare-two-text-files) + registry 4→18 (comparison of text 500k, text diff 50k, diff online 50k) from research/keywords/text-diff.csv — 2026-08-31 (ccddedd)
- [x] Canonical — apex→www 301 (vercel.json), astro.config.mjs site www, robots.txt sitemap www, sitemap.xml.ts dedup, BaseLayout canonical — build 119 pages all www (9a9a958) — verified Pages.csv 31+14 duplicate collapse

## Pending (Next in Queue — GSC Pages.csv leaders)
- [ ] JSON Formatter — Pages 66 imp how-to-format-json-file + 14/31 how-to-convert-json-to-readable — registry 9 keywords thin vs 500k vol, 4 Learn exist but no 500k coverage audit
- [ ] CSV vs JSON — compare/csv-vs-json 40 imp + json vs csv queries — 0 Learn for compare, registries json-to-csv 3 + csv-to-json 6 thin
- [ ] JSON Diff / SHA-512 / SHA-256 — tools 22/10 imp, registries 3–5 keywords thin vs 50k vol, comparisons exist but Learn 0 for json-diff gap (how-to-compare-json-files exists but text-diff vs json-diff only)
- [ ] How to Convert JSON to Readable — 31+14 duplicate, intent overlap with json-formatter — dedup + internal linking

## In Progress
- (none) — awaiting next research/keywords/*.csv (json-formatter, csv-vs-json, etc.) one by one, precisely

## Verify (Last)
- [ ] Re-submit https://www.freejsontoolkit.com/sitemap.xml (119 loc) in Search Console, confirm Pages.csv apex→www drop, watch Queries.csv 616 imp / 0 clicks move
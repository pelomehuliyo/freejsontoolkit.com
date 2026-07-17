# TODO - Integrate new brand assets (favicon/manifest)

- [ ] Update global head in `src/layouts/BaseLayout.astro` to use the required favicon + manifest tags (no duplicates).
- [ ] Remove/adjust any conflicting icon/manifest tags in `src/layouts/Layout.astro` (if unused, ensure no duplicate tags across project builds).
- [ ] Update `public/site.webmanifest` fields (name, short_name, theme/background/display, and correct icon references).
- [ ] Ensure `public/` contains all referenced icon files:
  - [ ] favicon.ico
  - [ ] favicon.svg
  - [ ] favicon-96x96.png
  - [ ] apple-touch-icon.png
  - [ ] site.webmanifest
  - [ ] favicon-192x192.png / 512 equivalents (or confirm existing filenames).
- [x] Search the entire repo for duplicate favicon/manifest tags and fix any remaining occurrences.
- [x] Run `npm run build` and fix any build errors introduced by the changes.



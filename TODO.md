# Launch readiness audit - TODO

- [ ] Fix Footer: remove all `href="#"` placeholder links; render as disabled/non-clickable with `aria-disabled="true"` when destination missing.
- [ ] Fix Mobile navigation accessibility in `Header.astro`:
  - [ ] Add `aria-expanded` + `aria-controls`
  - [ ] Add appropriate ARIA attributes on drawer (`role="dialog"`, `aria-modal="true"`)
  - [ ] Support closing with `Escape`
  - [ ] Restore focus to menu button after closing
  - [ ] Add lightweight focus management (basic focus trap while open)
- [ ] Add global keyboard focus indicator in `src/styles/global.css` using `:focus-visible` with high contrast.
- [ ] Run `npm run build`
- [ ] If build passes: `git add .` and `git commit -m "Improve accessibility and launch readiness"`

# Changelog

All notable changes to this project will be documented in this file.

The format is inspired by Keep a Changelog.

---

## [1.1.0] - 2026-07-30

### Added

- CSV → JSON converter (auto delimiter detection, header inference, runs in a Web Worker).
- JSON Formatter (beautify/pretty-print with 2-space, 4-space, or tab indent; sort keys).
- Shared document system: /why-local trust & architecture page, About, Contact, Privacy,
  Terms, Disclaimer; registry-driven sitemap.
- Catalog search, favorites & recently-used, keyboard shortcuts (? sheet, g-chords, / to
  search), and living editor empty states.

### Fixed

- Release hygiene: benchmarks isolated from unit tests, lint/format clean, sitemap routes.

---

## [1.0.0] - 2026-07-29

### Added

- Initial public release
- JSON → CSV converter
- Drag & Drop support
- File upload support
- Copy CSV
- Download CSV
- Large file support
- Worker-based conversion
- Responsive layout
- Accessibility improvements
- Keyboard shortcuts
- Error handling
- Privacy-first local processing

### Changed

- Refactored tool into reusable component architecture
- Introduced shared state store
- Introduced worker abstraction
- Introduced reusable ToolShell and editor components

### Fixed

- Editor scrolling
- Gutter synchronization
- Mobile layout issues
- Large file handling
- Accessibility regressions
- Copy/Download event wiring
- Production rendering issues

### Performance

- Improved mobile Lighthouse from ~49 → ~79
- Self-hosted fonts
- Reduced render-blocking resources

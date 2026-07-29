# Changelog

All notable changes to this project will be documented in this file.

The format is inspired by Keep a Changelog.

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

---

## Upcoming

### v1.0.1

- Bug fixes
- Editor improvements

### v1.1

- CSV → JSON converter
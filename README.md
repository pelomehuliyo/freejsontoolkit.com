# Free JSON Toolkit

> Fast, privacy-first JSON utilities that run entirely in your browser.

Convert, validate, format, and manipulate JSON without uploading your data to any server.

🌐 https://freejsontoolkit.com

---

## Features

### Available (28 tools)

**Convert**
- JSON → CSV Converter (`/tools/json-to-csv`)
- CSV → JSON Converter (`/tools/csv-to-json`)
- CSV → TSV (`/tools/csv-to-tsv`)
- TSV → CSV (`/tools/tsv-to-csv`)
- JSON → XML (`/tools/json-to-xml`)
- XML → JSON (`/tools/xml-to-json`)
- JSON → YAML (`/tools/json-to-yaml`)
- YAML → JSON (`/tools/yaml-to-json`)
- JSON → TOML (`/tools/json-to-toml`)
- TOML → JSON (`/tools/toml-to-json`)

**Format & Validate**
- JSON Formatter (`/tools/json-formatter`) — also covers beautify / pretty-print
- JSON Minifier (`/tools/json-minifier`)
- JSON Validator (`/tools/json-validator`)
- JSON Schema Lite (`/tools/json-schema-lite`)

**Compare**
- JSON Diff (`/tools/json-diff`)
- Text Diff (`/tools/text-diff`)

**Generate & Utilities**
- Fake JSON Generator (`/tools/fake-json`)
- UUID Generator (`/tools/uuid`)
- Base64 Encode / Decode (`/tools/base64`)
- URL Encode / Decode (`/tools/url-codec`)
- JWT Decoder (`/tools/jwt-decoder`)
- Timestamp Converter (`/tools/timestamp-converter`)
- Regex Tester (`/tools/regex-tester`)
- SHA-256 (`/tools/sha-256`)
- SHA-512 (`/tools/sha-512`)
- MD5 (`/tools/md5`)
- HMAC Generator (`/tools/hmac`)
- bcrypt Hasher (`/tools/bcrypt`)

Plus: Drag & Drop file support, Large file support (worker-based), Offline processing, Copy / Download output, Mobile responsive, Accessible interface, Zero tracking of your data

---

## Why Free JSON Toolkit?

Most online JSON tools upload your data to a server.

Free JSON Toolkit processes everything locally inside your browser.

Your files never leave your computer.

No accounts.

No API keys.

No subscriptions.

No tracking of your JSON.

---

## Built With

- Astro
- TypeScript
- Web Workers
- Vercel
- Vitest

---

## Performance

Designed to handle both small snippets and large datasets.

Features include

- Worker-based processing
- Responsive UI during conversion
- Cancelable operations
- Efficient editor rendering
- Large file handling

---

## Accessibility

Built with accessibility as a first-class feature.

- Keyboard navigation
- Screen reader support
- Focus management
- Live region announcements
- Accessible error reporting

---

## Project Structure

```
src/
├── components/
├── layouts/
├── lib/
│   ├── csv/
│   ├── state/
│   └── tools/
├── pages/
├── shared/
├── styles/
└── workers/
```

---

## Development

Clone the repository

```bash
git clone https://github.com/pelomehuliyo/freejsontoolkit.com.git
```

Install dependencies

```bash
npm install
```

Run development server

```bash
npm run dev
```

Production build

```bash
npm run build
```

Preview production build

```bash
npm run preview
```

Run tests

```bash
npm test
```

---

## Project Philosophy

Free JSON Toolkit follows a few simple principles.

- Privacy first
- Fast by default
- No unnecessary dependencies
- Accessible interfaces
- Clean architecture
- Reusable components
- Progressive enhancement

---

## Roadmap

### Version 1.0

- JSON → CSV Converter
- Component architecture
- Worker architecture
- Responsive UI
- Accessibility improvements

### Version 1.1 ✓ Shipped

- CSV → JSON Converter
- JSON Formatter
- Registry-driven sitemap
- Trust & architecture page (/why-local)

### Version 1.2 ✓ Shipped

- JSON Validator

### Version 1.3 ✓ Shipped

- JSON Minifier
- Base64 Encode / Decode
- UUID Generator
- Fake JSON Generator
- URL Encode / Decode

### Version 1.4 ✓ Shipped

- YAML ↔ JSON
- XML ↔ JSON
- Relations fix, registry `available` flag

### Version 1.5 ✓ Shipped

- Collections / families (`/collections`)
- Regex Tester
- CSV ⇄ TSV
- TOML ↔ JSON
- Text Diff
- JSON Schema Lite

### Version 1.6 ✓ Shipped

- Timestamp Converter (with BigInt fix)
- Large-file mode + `/large-files` guide
- Compare pages

### Version 1.7 ✓ Shipped

- SHA-256, SHA-512, MD5
- HMAC Generator
- bcrypt Hasher

### Future

Build one of the largest collections of free developer tools while keeping every tool lightweight, privacy-friendly, and fast.

---

## Contributing

Contributions are welcome.

If you'd like to improve the project:

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a Pull Request.

Please keep pull requests focused and follow the existing code style.

---

## Reporting Issues

Found a bug?

Open an issue with:

- browser
- operating system
- reproduction steps
- screenshots (if applicable)

---

## License

MIT License

---

Made with ❤️ for developers.

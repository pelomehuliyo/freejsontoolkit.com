/**
 * Per-tool documentation — real reference content, not marketing. Each entry
 * drives the <ToolDocs> component: a concept that opens with a living lead
 * artifact, a list of common errors / things-to-know (many carrying a snippet
 * the user can fire into the tool to see live), and runnable examples. The
 * closing "pair this with" line is read from relations.ts at render time, so
 * this map only owns the prose. Add a tool = add one entry; the component
 * renders nothing for tools absent from the map, so the tag is safe everywhere.
 *
 * Snippets are kept free of backslashes / template markers so they survive as
 * plain template-literal strings and round-trip through the JSON island intact.
 */
export type DocLead = "error-anatomy" | "before-after";
export type DocItemKind = "error" | "note";

export interface DocItem {
  title: string;
  body: string;
  kind: DocItemKind;
  /** when present, the row carries a "load into tool" button + the snippet */
  snippet?: string;
}
export interface DocExample {
  title: string;
  snippet: string;
  note: string;
}
export interface ToolDoc {
  eyebrow: string;
  conceptTitle: string;
  concept: string;
  lead: DocLead;
  itemsLabel: string;
  items: DocItem[];
  examplesLabel: string;
  examples: DocExample[];
}

export const DOCS: Record<string, ToolDoc> = {
  "json-validator": {
    eyebrow: "Docs · Validate",
    conceptTitle: "What validation actually checks",
    concept:
      "Validating JSON means parsing it against the JSON grammar — brackets balanced, strings closed, " +
      "commas and colons where they belong, numbers and literals well-formed. It is a syntax check, not a " +
      "meaning check: the validator confirms the document is *shaped* like JSON, not that it matches some " +
      "expected schema (schema validation is a separate, later tool). When something is wrong, the engine " +
      "walks the text character by character and reports the exact line and column where the grammar breaks, " +
      "with the offending lines and a caret so you can fix it without hunting. All of it runs in your browser.",
    lead: "error-anatomy",
    itemsLabel: "Common errors",
    items: [
      {
        kind: "error",
        title: "Trailing comma",
        body:
          "JSON forbids a comma after the last item in an object or array. It is the single most common " +
          "mistake when editing by hand. Delete the comma before the closing bracket.",
        snippet: `{\n  "name": "Ada",\n  "role": "engineer",\n}`,
      },
      {
        kind: "error",
        title: "Unexpected end of input",
        body:
          "A bracket, brace, or string was opened and never closed. The caret lands at the end of the text " +
          "because that is where the parser ran out while still expecting more. Add the missing close.",
        snippet: `{\n  "name": "Ada",\n  "role": "engineer"`,
      },
      {
        kind: "error",
        title: "Unquoted key",
        body:
          "Object keys must be double-quoted strings. JavaScript object literals let you skip the quotes; " +
          "JSON does not. Wrap the key in double quotes.",
        snippet: `{\n  name: "Ada"\n}`,
      },
      {
        kind: "error",
        title: "Single quotes",
        body:
          "JSON only accepts double quotes for strings and keys. Single quotes are valid in JavaScript but " +
          "not in JSON. Replace them with double quotes.",
        snippet: `{\n  'name': 'Ada'\n}`,
      },
    ],
    examplesLabel: "Try these",
    examples: [
      {
        title: "Nested object",
        note: "A valid document with nesting and mixed types — should report Valid.",
        snippet: `{\n  "user": { "id": 1, "name": "Ada" },\n  "active": true,\n  "score": null\n}`,
      },
      {
        title: "Array of records",
        note: "Top-level arrays are valid JSON too. Each element is checked in turn.",
        snippet: `[\n  { "id": 1, "ok": true },\n  { "id": 2, "ok": false }\n]`,
      },
    ],
  },
  "json-to-xml": {
    eyebrow: "Docs · JSON → XML",
    conceptTitle: "Generating XML from JSON",
    concept:
      "JSON → XML takes a JSON object or array and builds a well-formed XML document from it. " +
      "Every property becomes an element; nested objects become nested elements; arrays become repeated elements. " +
      "You can control how attributes are handled (prefixing keys with `@`), how empty elements are treated, and whether to pretty‑print the output. " +
      "The conversion runs locally, with no external dependencies.",
    lead: "before-after", // we'll reuse the before/after pattern
    itemsLabel: "Things to know",
    items: [
      {
        kind: "note",
        title: "Root element",
        body:
          "The root of your JSON must be an object with a single key that becomes the root element name. " +
          "If your JSON is an array, the root element name must be specified via the 'rootName' option (we can add that later).",
      },
      {
        kind: "note",
        title: "Attributes",
        body:
          'Keys starting with `@` are treated as attributes. For example, `{ "@id": "123" }` becomes `<element id="123"/>`. ' +
          "Enable or disable this with the 'Include attributes' option.",
      },
      {
        kind: "note",
        title: "Empty elements",
        body:
          "An empty object or a null value becomes an empty element (e.g., `<tag></tag>`). " +
          "The 'Include empty elements' option can suppress them.",
      },
      {
        kind: "note",
        title: "Arrays",
        body:
          "An array of objects becomes repeated elements with the same name. " +
          "If you want a single element to contain multiple children, use an array.",
      },
    ],
    examplesLabel: "Try these",
    examples: [
      {
        title: "Simple object",
        note: "A basic JSON object with a root element.",
        snippet: `{ "book": { "title": "The Hobbit", "author": "J.R.R. Tolkien" } }`,
      },
      {
        title: "With attributes",
        note: "Attributes are marked with @ prefix.",
        snippet: `{ "book": { "@id": "978-0-547-92522-8", "title": "The Hobbit" } }`,
      },
      {
        title: "Arrays and nesting",
        note: "Arrays become repeated elements.",
        snippet: `{ "books": [ { "title": "The Hobbit" }, { "title": "The Lord of the Rings" } ] }`,
      },
    ],
  },
  "yaml-to-json": {
    eyebrow: "Docs · YAML → JSON",
    conceptTitle: "What the conversion does (and gives up)",
    concept:
      "YAML is a superset of JSON — every JSON document is already (nearly) valid YAML, so the " +
      "conversion is one-directional by nature. The engine parses your YAML 1.2 and re-serializes " +
      "the result as pretty-printed JSON. Three things change in the crossing: comments are " +
      "dropped because JSON has nowhere to keep them; anchors and aliases are resolved to their " +
      "expanded values; and YAML timestamps become ISO-8601 strings, since JSON has no date type. " +
      "One thing deliberately does not happen: duplicate keys are rejected with an exact line and " +
      "column instead of being silently collapsed — JSON output would keep only the last value, " +
      "and we'd rather point at the problem than drop your data. Large files convert in a " +
      "background worker so the editor never locks up.",
    lead: "before-after",
    itemsLabel: "Things to know",
    items: [
      {
        kind: "error",
        title: "Bad indentation",
        body:
          "YAML structure lives in its whitespace. A line that sits one space too deep (or too " +
          "shallow) breaks the parse — and tabs are forbidden for indentation entirely. Load this " +
          "and the caret lands on the offending line.",
        snippet: `user:
  name: Ada
   role: engineer`,
      },
      {
        kind: "error",
        title: "Unclosed flow mapping",
        body:
          "Inline { } and [ ] collections must be closed. When one isn't, the parser runs out of " +
          "input mid-collection and reports it at the end of the text.",
        snippet: `user: { name: Ada`,
      },
      {
        kind: "error",
        title: "Duplicate keys",
        body:
          "The converter refuses to silently keep only the last value. Fix the duplicate (or " +
          "decide which one is real) and convert again.",
        snippet: `name: Ada
name: Alan`,
      },
      {
        kind: "note",
        title: "Comments disappear",
        body:
          "JSON has no comment syntax, so every # comment is dropped on conversion. If a comment " +
          "carries real information, move it into a data field before converting.",
      },
      {
        kind: "note",
        title: "Dates become ISO strings",
        body:
          "A bare YAML date converts to an ISO-8601 string in JSON. Load this and convert — the " +
          "output carries the full timestamp as text.",
        snippet: `shipped: 2026-08-02`,
      },
    ],
    examplesLabel: "Try these",
    examples: [
      {
        title: "Simple config",
        note: "Scalars of every type — string, number, boolean, null.",
        snippet: `name: Ada
role: engineer
level: 7
active: true
alias: null`,
      },
      {
        title: "Nested with a list",
        note: "Block sequences become JSON arrays; nesting becomes objects.",
        snippet: `toolkit:
  name: Free JSON Toolkit
  tools:
    - yaml-to-json
    - json-formatter
  limits:
    uploads: 0`,
      },
      {
        title: "Anchors and aliases",
        note: "&base defines an anchor; *base expands it — the JSON contains the full value.",
        snippet: `base: &base
  retries: 3
  timeout: 30
production:
  settings: *base
  host: api.example.com`,
      },
    ],
  },
  "jwt-decoder": {
    eyebrow: "Docs · JWT",
    conceptTitle: "What decoding is (and what it is not)",
    concept:
      "A JWT is three base64url segments joined by dots: a header, a payload, and a signature. The " +
      "first two are encoded, not encrypted — anyone holding the token can decode and read them, " +
      "which is exactly what this tool does, entirely in your browser. The signature is what a " +
      "verifier checks against a key; this page has no key, so it decodes and stops, and says so " +
      "loudly. Reading the payload tells you what the token claims; it never tells you whether " +
      "those claims are true.",
    lead: "before-after",
    itemsLabel: "Things to know",
    items: [
      {
        kind: "note",
        title: "Decoded ≠ verified",
        body:
          "Anyone can base64-encode a payload that says admin: true. Only the holder of the signing " +
          "key can produce a signature that verifies. This tool shows you the claims; it cannot and " +
          "does not vouch for them.",
      },
      {
        kind: "note",
        title: "exp / iat / nbf are time facts",
        body:
          "Numeric date claims are rendered as human dates with an expired / valid-so-far indicator. " +
          "That's a statement about the clock, not about authenticity — an expired token can still be " +
          "a genuine one, and a valid-looking one can still be forged.",
      },
      {
        kind: "error",
        title: "Wrong number of segments",
        body:
          "A JWS (the common JWT) has exactly three dot-separated parts. Load this and the decoder " +
          "tells you the count it found.",
        snippet: `eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0`,
      },
      {
        kind: "error",
        title: "alg: none",
        body:
          "A token declaring alg none with an empty signature is unsigned — anyone could have made " +
          "it. The decoder flags this loudly; servers that accept such tokens are vulnerable.",
      },
    ],
    examplesLabel: "Try these",
    examples: [
      {
        title: "The classic sample",
        note: "The canonical example token — HS256, with an iat claim to interpret.",
        snippet:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
          "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ." +
          "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
      },
    ],
  },
  "xml-to-json": {
    eyebrow: "Docs · XML → JSON",
    conceptTitle: "Parsing XML into JSON",
    concept:
      "XML → JSON parses an XML document and converts it to a JSON representation. " +
      "Attributes become properties prefixed with `@`; text content becomes a `#text` property (or is merged when possible). " +
      "Repeated elements are preserved as arrays. " +
      "The parser handles comments, CDATA, and basic namespaces, but keeps the output clean and readable. " +
      "All processing happens locally.",
    lead: "before-after", // show a before/after of XML to JSON
    itemsLabel: "Common issues & tips",
    items: [
      {
        kind: "error",
        title: "Missing closing tag",
        body:
          "If your XML is missing a closing tag, the parser will throw an error. " +
          "Check the line and column of the error message to fix it.",
        snippet: `<root><name>Ada</root>`,
      },
      {
        kind: "note",
        title: "Attributes as @",
        body:
          'Attributes are stored as `@attributeName`. For example, `<item id="1"/>` becomes `{ "@id": "1" }`. ' +
          "Turn off attribute inclusion if you only need the element content.",
      },
      {
        kind: "note",
        title: "Text content",
        body:
          "Text content becomes `#text` when there are attributes or child elements; otherwise, it becomes a direct string value. " +
          "This keeps the JSON clean and type‑friendly.",
      },
      {
        kind: "note",
        title: "CDATA",
        body:
          "CDATA sections are treated as normal text content and are included. " +
          "They are not wrapped in a special property.",
      },
    ],
    examplesLabel: "Try these",
    examples: [
      {
        title: "Simple XML",
        note: "A basic XML document with a single root and element.",
        snippet: `<root><name>Ada Lovelace</name></root>`,
      },
      {
        title: "With attributes",
        note: "Attributes are preserved with @ prefix.",
        snippet: `<root><item id="1">First</item></root>`,
      },
      {
        title: "Nested and repeated",
        note: "Repeated elements become arrays.",
        snippet: `<root><user><name>Ada</name></user><user><name>Alan</name></user></root>`,
      },
    ],
  },

  "regex-tester": {
    eyebrow: "Docs · Regex",
    conceptTitle: "How the tester matches",
    concept:
      "The tester compiles your pattern with the browser's native RegExp engine and runs it against " +
      "the test string as you type — no server, no upload. Every match highlights in the view, and " +
      "each match lists its capture groups, numbered ($1, $2…) and named. Flags reshape how the same " +
      "pattern behaves: g returns every match instead of stopping at the first, i ignores case, m " +
      "makes ^ and $ match line boundaries, s lets . cross newlines, u switches on full Unicode, and " +
      "y pins the match to the current position. Load any snippet below with \"try it\" — the pattern " +
      "and the test text both fill in, and the matches light up.",
    lead: "before-after",
    itemsLabel: "Things to know",
    items: [
      {
        kind: "error",
        title: "Unescaped specials match too much",
        body:
          "Characters like . * + ? ( ) [ ] { } ^ $ | carry meaning. A bare . matches ANY character, " +
          "not a period. Load this, then delete the backslash before the dot and watch file-txt start " +
          "matching too — backslash a special to match it literally.",
        snippet: `\\.
file.txt
file-txt`,
      },
      {
        kind: "note",
        title: "Groups capture pieces",
        body:
          "( ) captures a numbered group — $1, $2…; (?<name> ) captures a named one. Load this and " +
          "open a match card to see both the numbered groups and name / role appear by name.",
        snippet: `(?<name>[A-Za-z]+), ([a-z]+)
Ada, engineer
Grace, admiral`,
      },
      {
        kind: "note",
        title: "Flags reshape the match",
        body:
          "The same pattern matches different text under different flags. Load this, then toggle i " +
          "and watch ADA match; toggle g off and only the first match is returned.",
        snippet: `ada
Ada and ada and ADA`,
      },
      {
        kind: "note",
        title: "A pattern can hang the tab",
        body:
          "Nested quantifiers like (a+)+b can backtrack explosively on near-matching text — " +
          "catastrophic backtracking. The test string is capped at 500k characters to bound the blast " +
          "radius, but if a match seems to freeze, simplify the pattern. No runnable snippet here on " +
          "purpose: we won't ship a hang.",
      },
    ],
    examplesLabel: "Try these",
    examples: [
      {
        title: "Email addresses",
        note: "Word boundaries stop it matching inside longer tokens; [A-Za-z]{2,} requires a real TLD — @missing.com stays unmatched.",
        snippet: `\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b
Reach us at support@freejsontoolkit.com or sales@example.org — @missing.com stays unmatched.`,
      },
      {
        title: "Dates into named groups",
        note: "Named groups land in each match card by name — year, month, day.",
        snippet: `(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})
Shipped 2026-08-03, patched 2025-12-31.`,
      },
      {
        title: "Every number",
        note: "With g on, all of them light up; toggle it off to keep just the first.",
        snippet: `\\d+(\\.\\d+)?
3 items at 4.99 each, 1 at 12, tax 1.05`,
      },
    ],
  },
  "timestamp-converter": {
    eyebrow: "Docs · Timestamp",
    conceptTitle: "Two directions across one instant",
    concept:
      "A Unix timestamp counts the elapsed time since the epoch — January 1st, 1970, 00:00:00 UTC — " +
      "in a chosen unit: seconds (classic Unix), milliseconds (what JavaScript's Date.now() returns), " +
      "microseconds (Go, Postgres), or nanoseconds (Go, Rust). In the Timestamp → Date direction the " +
      "engine rescales your number to milliseconds, builds a Date, and shows the same instant in your " +
      "local time and UTC, plus a richer breakdown (day of year, ISO week, relative time). In the " +
      "reverse direction it parses a human-readable date — local ISO, UTC (Z), RFC/HTTP, or a bare " +
      "date — and reports the equivalent value in every unit at once. All of it runs locally on the " +
      "browser's native Date engine.",
    lead: "before-after",
    itemsLabel: "Things to know",
    items: [
      {
        kind: "error",
        title: "Magnitude betrays the unit",
        body:
          "A timestamp's digit count usually tells you its unit: 10 digits is seconds, 13 is " +
          "milliseconds, 16 is microseconds, 19 is nanoseconds. Load this — it's a seconds value — " +
          "then try switching the unit to milliseconds and watch the date jump to 1970-Jan-01.",
        snippet: `1753862400`,
      },
      {
        kind: "error",
        title: "Fractional seconds",
        body:
          "A timestamp can carry a decimal part (e.g. 1753862400.5). Because the engine always " +
          "rescales through milliseconds, the fractional second survives the round-trip instead of " +
          "being silently dropped.",
        snippet: `1753862400.5`,
      },
      {
        kind: "note",
        title: "Local vs UTC is not a bug",
        body:
          "A timestamp is an absolute instant, but the same instant is displayed differently in your " +
          "local timezone versus UTC. The readout shows both side by side, so an 'off by an hour' " +
          "is your zone's offset — not an error in the conversion.",
      },
      {
        kind: "note",
        title: "What the reverse accepts",
        body:
          "Date → Timestamp parses local ISO strings (2026-08-05T12:00:00, treated as your local " +
          "time), UTC ISO strings ending in Z, RFC/HTTP dates like Wed, 05 Aug 2026 12:00:00 GMT, " +
          "and bare dates like 2026-08-05 (local midnight). Anything else reports the exact error.",
        snippet: `2026-08-05T12:00:00`,
      },
    ],
    examplesLabel: "Try these",
    examples: [
      {
        title: "The classic epoch",
        note: "10-digit seconds — the number every Unix reference starts from.",
        snippet: `0`,
      },
      {
        title: "A modern second",
        note: "A typical 2020s timestamp in seconds.",
        snippet: `1753862400`,
      },
      {
        title: "Milliseconds",
        note: "13 digits — what new Date().getTime() returns in JavaScript.",
        snippet: `1753862400000`,
      },
      {
        title: "Date to timestamp",
        note: "Switch to Date → Timestamp and watch every unit appear at once.",
        snippet: `2026-08-05T12:00:00`,
      },
    ],
  },
  "json-formatter": {
    eyebrow: "Docs · Format",
    conceptTitle: "What formatting does (and cannot do)",
    concept:
      "Formatting is parse, then re-serialize: the engine reads your JSON into memory and writes it back out " +
      "with consistent indentation, so a cramped one-liner becomes something a human can scan. Because it " +
      "parses first, it *cannot* repair broken JSON — if the input is invalid you get the exact error instead " +
      "of a guess, and the right move is to validate and fix it, then format. Minifying is the same operation " +
      "in reverse (indentation set to zero), which is why the two tools share an engine. Large documents " +
      "format in a background worker so the editor never locks up.",
    lead: "before-after",
    itemsLabel: "Things to know",
    items: [
      {
        kind: "note",
        title: "Invalid input won't format",
        body:
          "The formatter reports the line and column of the problem rather than silently producing wrong " +
          "output. Fix the syntax (the Validator pinpoints it) and format again.",
      },
      {
        kind: "error",
        title: "A trailing comma breaks it",
        body:
          "Because formatting parses first, the same trailing-comma mistake that breaks validation breaks " +
          "formatting too. Load this and you'll see the error, not a pretty result.",
        snippet: `{\n  "name": "Ada",\n  "role": "engineer",\n}`,
      },
      {
        kind: "note",
        title: "Sort keys reorders, never rewrites",
        body:
          "Enabling sort-keys reorders each object's properties alphabetically for stable diffs. Values are " +
          "untouched and array order is always preserved.",
      },
      {
        kind: "note",
        title: "Indentation is a display choice",
        body:
          "2-space, 4-space, and tab produce identical data with different whitespace. Pick whatever the " +
          "file you're pasting into expects.",
      },
    ],
    examplesLabel: "Try these",
    examples: [
      {
        title: "Minified blob",
        note: "A single cramped line — watch it expand into readable structure.",
        snippet: `{"name":"Ada","role":"engineer","tags":["pioneer","writer"],"active":true}`,
      },
      {
        title: "Deep nesting",
        note: "Indentation stays correct at any depth.",
        snippet: `{"a":{"b":{"c":[1,2,3],"d":true}}}`,
      },
    ],
  },
  "json-minifier": {
    eyebrow: "Docs · Format",
    conceptTitle: "Minifying is formatting run in the opposite direction",
    concept:
      "Minifying is the same operation as formatting, done in reverse: the engine parses your JSON " +
      "into memory and writes it back out with every bit of whitespace removed, so a pretty-printed " +
      "document collapses to a single dense line. Because it parses first, it *cannot* repair broken " +
      "JSON — invalid input reports the exact line and column instead of a guess. Your data is never " +
      "altered: only whitespace disappears, and the optional sort-keys reorders object properties " +
      "alphabetically without touching a value. The readout shows the before/after byte counts and " +
      "the percentage you saved, and large files run in a background worker so the editor never locks up.",
    lead: "before-after",
    itemsLabel: "Things to know",
    items: [
      {
        kind: "note",
        title: "Smaller is the point — not readable",
        body:
          "Minified JSON is deliberately hard for a human to scan. Use it when size and transfer cost " +
          "matter more than readability — an API body, a URL, a bundle, storage. For reading or editing, " +
          "reach for the Formatter instead.",
      },
      {
        kind: "error",
        title: "Invalid input won't minify",
        body:
          "Minification parses first, so the same trailing-comma mistake that breaks validation breaks " +
          "minifying too. Load this and you'll get the exact error, not a compact result.",
        snippet: `{\n  "name": "Ada",\n  "role": "engineer",\n}`,
      },
      {
        kind: "note",
        title: "Sort keys never rewrites values",
        body:
          "Enabling sort-keys reorders each object's properties alphabetically for stable, diff-friendly " +
          "output. Values are untouched and array order is always preserved.",
      },
      {
        kind: "note",
        title: "Whitespace inside strings is sacred",
        body:
          "Spaces inside a quoted string are data, not padding — they are preserved exactly. The minifier " +
          "only strips the whitespace that sits between tokens.",
        snippet: `{\n  "phrase": "hello   world"\n}`,
      },
    ],
    examplesLabel: "Try these",
    examples: [
      {
        title: "Cramped one-liner",
        note: "It's already small — minifying keeps it exact and reports the tiny saving.",
        snippet: `{"name":"Ada","role":"engineer","tags":["pioneer","writer"],"active":true}`,
      },
      {
        title: "Pretty-printed source",
        note: "Watch a readable document collapse to a single dense line.",
        snippet: `{\n  "user": { "id": 1, "name": "Ada" },\n  "active": true,\n  "score": null\n}`,
      },
    ],
  },
  "json-diff": {
    eyebrow: "Docs · Compare",
    conceptTitle: "A diff sees structure, not just lines",
    concept:
      "JSON Diff parses both documents and compares them as data, so it understands structure: a " +
      "reformatted or re-keyed object doesn't read as a change, and an added, removed, or changed " +
      "field is reported precisely. The diff renders side-by-side (additions teal, removals red, " +
      "changed lines facing each other) or as a single unified column you can copy or download as a " +
      "patch. Options let you ignore whitespace or case to cut noise, and a similarity score tells " +
      "you at a glance how much the two sides share. Everything runs locally, in a worker for large inputs.",
    lead: "before-after",
    itemsLabel: "Things to know",
    items: [
      {
        kind: "note",
        title: "Reformatting is not a change",
        body:
          "Because the diff compares parsed data, adding or removing indentation produces no diff at " +
          "all. That's the point — you're comparing meaning, not bytes. Text Diff is the tool if you " +
          "care about the exact lines as written.",
      },
      {
        kind: "error",
        title: "One side won't parse",
        body:
          "Both inputs must be valid JSON. If a side has a syntax error, the diff can't compare it — " +
          "fix that side (the Validator pinpoints it) or load a corrected version.",
        snippet: `{\n  "name": "Ada",\n  "role": "engineer",\n}`,
      },
      {
        kind: "note",
        title: "What the similarity score means",
        body:
          "It's the share of identical lines on both sides, as a percentage of all lines involved. " +
          "100% means identical; 0% means nothing in common. A changed value next to an unchanged " +
          "block lands somewhere between.",
      },
      {
        kind: "note",
        title: "Ignore whitespace / case for reviews",
        body:
          "Toggling ignore-whitespace or ignore-case silences cosmetic noise so a code review reads " +
          "the real change. They compare the parsed values, so they apply cleanly to structured data.",
      },
    ],
    examplesLabel: "Try these",
    examples: [
      {
        title: "A field changed",
        note: "Paste into A and B — the role value lights up as a changed line facing its pair.",
        snippet: `{\n  "name": "Ada",\n  "role": "engineer"\n}`,
      },
      {
        title: "A field added",
        note: "B gains an active flag — the diff reports it as added.",
        snippet: `{\n  "name": "Ada",\n  "role": "engineer",\n  "active": true\n}`,
      },
      {
        title: "Array element removed",
        note: "A has three tags, B has two — the missing one shows as removed.",
        snippet: `{\n  "tags": ["pioneer", "writer", "analyst"]\n}`,
      },
    ],
  },
  "json-to-csv": {
    eyebrow: "Docs · Convert",
    conceptTitle: "Flattening a tree into a table",
    concept:
      "JSON → CSV turns an array of JSON objects into a flat CSV table. Each object becomes a row and " +
      "its keys become columns. Because CSV is flat, nested objects must be flattened first using dot " +
      "notation — { \"user\": { \"name\": \"John\" } } becomes a user.name column — and you can choose " +
      "the delimiter (comma, semicolon, or tab), whether to include a header row, and whether to " +
      "flatten nesting at all. Conversion runs in a background worker for large files so the editor " +
      "stays responsive, and the floor is a clean CSV you can open in any spreadsheet.",
    lead: "before-after",
    itemsLabel: "Common issues & tips",
    items: [
      {
        kind: "error",
        title: "Top-level must be an array",
        body:
          "The converter expects an array of objects — one object per row. A bare object, string, or " +
          "number has no rows to flatten into. Load this and read the message.",
        snippet: `{ "name": "Ada", "role": "engineer" }`,
      },
      {
        kind: "note",
        title: "Ragged rows become empty cells",
        body:
          "When objects have different keys, the union of all keys becomes the header and missing " +
          "values are left blank. Enable flatten if you have nested objects; otherwise nested values " +
          "are serialized into a single cell.",
        snippet: `[\n  { "id": 1, "name": "Ada" },\n  { "id": 2, "name": "Alan", "role": "engineer" }\n]`,
      },
      {
        kind: "note",
        title: "Delimiter is a destination choice",
        body:
          "Comma works with most spreadsheets. Semicolon suits locales where comma is the decimal " +
          "separator, and tab is handy for pasting into editors. Pick what the file you're opening " +
          "expects.",
      },
      {
        kind: "note",
        title: "Flattening is lossy in one direction",
        body:
          "Nested structure does not round-trip: a CSV row can't nest, so converting back (CSV → JSON) " +
          "won't restore the original tree. Flatten when the table is the destination, not a detour.",
      },
    ],
    examplesLabel: "Try these",
    examples: [
      {
        title: "Simple records",
        note: "Three keys, two rows — a textbook array of objects.",
        snippet: `[\n  { "id": 1, "name": "Ada", "email": "ada@example.com" },\n  { "id": 2, "name": "Alan", "email": "alan@example.com" }\n]`,
      },
      {
        title: "With nesting",
        note: "Flatten turns user.name into a dotted column.",
        snippet: `[\n  { "id": 1, "user": { "name": "Ada" } },\n  { "id": 2, "user": { "name": "Alan" } }\n]`,
      },
    ],
  },
  "csv-to-json": {
    eyebrow: "Docs · Convert",
    conceptTitle: "Giving a flat table some structure",
    concept:
      "CSV → JSON parses a table and turns it into an array of objects. Delimiters are auto-detected " +
      "(comma, semicolon, tab, or pipe) and quoted fields holding commas or newlines are read " +
      "correctly per RFC 4180. With the default \"first row is a header\", that row becomes the object " +
      "keys; turn it off and synthetic keys (column1, column2, …) are used instead. You can skip " +
      "blank lines and choose the output indentation. Everything runs locally, so the only visible " +
      "result is structured JSON you can paste or download.",
    lead: "before-after",
    itemsLabel: "Common issues & tips",
    items: [
      {
        kind: "error",
        title: "Ragged rows break the table",
        body:
          "A row with a different number of cells than the others is a structural error — the parser " +
          "reports the exact line instead of silently padding or dropping, which would change your data.",
        snippet: `id,name,email\n1,Ada,ada@example.com\n2,Alan`,
      },
      {
        kind: "note",
        title: "Quoted fields keep their commas",
        body:
          "A field wrapped in double quotes may contain a delimiter or a newline and stays one cell. " +
          "The parser handles this, so a comma inside a quoted name never splits the row.",
        snippet: `name,city\n"Turing, Alan",London`,
      },
      {
        kind: "note",
        title: "Header row sets the keys",
        body:
          "With \"first row is a header\" on (default), the first row becomes the object keys. Turn it " +
          "off to keep every row as data and get column1, column2, … instead.",
        snippet: `id,name\n1,Ada\n2,Alan`,
      },
      {
        kind: "note",
        title: "Delimiters are auto-detected",
        body:
          "The parser figures out whether your file uses commas, semicolons, tabs, or pipes. You can " +
          "also pin a delimiter manually if a value happens to look like a different one.",
      },
    ],
    examplesLabel: "Try these",
    examples: [
      {
        title: "Header + data",
        note: "The header row becomes the object keys.",
        snippet: `id,name,email\n1,Ada,ada@example.com\n2,Alan,alan@example.com`,
      },
      {
        title: "Quoted comma",
        note: "The quoted field stays one cell despite the comma.",
        snippet: `name,city\n"Turing, Alan",London`,
      },
    ],
  },
  "json-to-yaml": {
    eyebrow: "Docs · Convert",
    conceptTitle: "JSON is already nearly YAML — this just makes it readable",
    concept:
      "YAML is a superset of JSON, so JSON → YAML is a re-serialization job: the engine parses your " +
      "JSON and writes it back out as indentation-based YAML. Objects become nested mappings, arrays " +
      "become block sequences (order always preserved), and scalars keep their types. Strings are " +
      "quoted only when they need to be — special characters, leading/trailing spaces, or empty — " +
      "and left plain otherwise for readability. You can choose the indentation and optionally sort " +
      "object keys for deterministic output. Null becomes the standard YAML null. Large files run " +
      "in a background worker so the editor stays responsive.",
    lead: "before-after",
    itemsLabel: "Things to know",
    items: [
      {
        kind: "error",
        title: "Invalid JSON won't convert",
        body:
          "The converter parses JSON first, so a syntax error stops it with the exact line and column. " +
          "Fix the source (the Validator pinpoints it) and convert again.",
        snippet: `{\n  "name": "Ada",\n  "role": "engineer",\n}`,
      },
      {
        kind: "note",
        title: "Strings are quoted only when necessary",
        body:
          "A plain unquoted string stays bare for readability. Strings containing special characters, " +
          "leading or trailing spaces, or empty strings are quoted so they round-trip exactly.",
        snippet: `{"note": "  indented  ", "plain": "hello"}`,
      },
      {
        kind: "note",
        title: "Array order is always preserved",
        body:
          "Only object keys can be sorted (optionally). Arrays are always output in the order they " +
          "appear in the JSON — sorting would change your data.",
      },
      {
        kind: "note",
        title: "Null is null",
        body:
          "A JSON null becomes the YAML null, which is the standard representation. Empty values are " +
          "never silently dropped.",
        snippet: `{"a": null, "b": 1}`,
      },
    ],
    examplesLabel: "Try these",
    examples: [
      {
        title: "Simple config",
        note: "Scalars of every type map cleanly to YAML.",
        snippet: `{"name": "Ada", "role": "engineer", "level": 7, "active": true, "alias": null}`,
      },
      {
        title: "Nested with a list",
        note: "Objects and arrays become indented mappings and sequences.",
        snippet: `{"toolkit": {"name": "Free JSON Toolkit", "tools": ["json-to-yaml", "json-formatter"]}}`,
      },
    ],
  },
  "json-to-toml": {
    eyebrow: "Docs · Convert",
    conceptTitle: "Translating JSON into a config format with no null",
    concept:
      "JSON → TOML parses a JSON object and writes it back as TOML: objects become [tables], arrays " +
      "of objects become [[arrays.of.tables]], and scalars keep their types. The one real friction is " +
      "null — TOML has no null value, so by default the converter refuses and points at the exact " +
      "path (like limits.timeout or tools[2]); switch to \"Strip nulls\" to drop those keys/elements " +
      "and convert anyway. A top-level JSON array fails too, because TOML's root must be a table. " +
      "Large files run in a background worker, and the output is clean, hand-editable TOML.",
    lead: "before-after",
    itemsLabel: "Common issues & tips",
    items: [
      {
        kind: "error",
        title: "TOML has no null",
        body:
          "A JSON null has nowhere to live in TOML. The converter refuses by default and names the " +
          "exact path; switch to \"Strip nulls\" to drop those keys and convert anyway.",
        snippet: `{"limits": {"timeout": null, "retries": 3}}`,
      },
      {
        kind: "error",
        title: "A top-level array has no home",
        body:
          "TOML's root must be a table (an object). A top-level JSON array, or a bare string, number, " +
          "or boolean, has nowhere to live — the converter explains that instead of wrapping it in a " +
          "made-up key.",
        snippet: `[{"name": "Ada"}, {"name": "Alan"}]`,
      },
      {
        kind: "note",
        title: "Numbers keep their shape",
        body:
          "JSON's single number type maps to TOML integers and floats. Very large integers (beyond " +
          "2^53) can lose precision — that's a JSON limit, not a bug here.",
      },
      {
        kind: "note",
        title: "Objects become tables",
        body:
          "A nested object becomes a [table]; an array of objects becomes an [[array.of.tables]]. " +
          "Plain arrays of scalars become inline arrays, and order is preserved.",
        snippet: `{"servers": [{"host": "a", "port": 80}, {"host": "b", "port": 443}]}`,
      },
    ],
    examplesLabel: "Try these",
    examples: [
      {
        title: "Simple object",
        note: "Flat keys map straight to TOML.",
        snippet: `{"name": "Ada", "role": "engineer", "level": 7}`,
      },
      {
        title: "Nested tables",
        note: "Objects become [tables]; nested values stay grouped.",
        snippet: `{"database": {"host": "localhost", "ports": [5432, 5433]}}`,
      },
      {
        title: "Array of tables",
        note: "An array of objects becomes [[arrays.of.tables]].",
        snippet: `{"servers": [{"host": "a", "active": true}, {"host": "b", "active": false}]}`,
      },
    ],
  },
  "toml-to-json": {
    eyebrow: "Docs · Convert",
    conceptTitle: "Turning a config into a JSON tree",
    concept:
      "TOML → JSON parses a TOML config and re-serializes it as pretty-printed JSON. Tables become " +
      "nested objects, arrays stay arrays, and the parser reports exact line numbers when something " +
      "is wrong. Three things change in the crossing: TOML datetimes become ISO-8601 strings because " +
      "JSON has no date type; comments are dropped because JSON has nowhere to keep them; and TOML's " +
      "integer/float distinction flattens into JSON's single number type (inf and nan become null). " +
      "Duplicate keys are refused with a line and column rather than silently collapsed. Large files " +
      "run in a background worker so the editor never locks up.",
    lead: "before-after",
    itemsLabel: "Common issues & tips",
    items: [
      {
        kind: "error",
        title: "Duplicate keys are refused",
        body:
          "The TOML spec forbids duplicate keys, and the parser refuses rather than silently keeping " +
          "one — you get an exact line and column so you can fix it.",
        snippet: `name = "Ada"\nname = "Alan"`,
      },
      {
        kind: "error",
        title: "Bad indentation in a table",
        body:
          "TOML is not whitespace-sensitive for structure, but a malformed table header breaks the " +
          "parse. Load this and the caret lands on the offending line.",
        snippet: `[server]\nhost = "localhost"\n  port = 5432`,
      },
      {
        kind: "note",
        title: "Dates become ISO strings",
        body:
          "A TOML datetime converts to an ISO-8601 string in JSON — JSON has no date type. Load this " +
          "and convert; the output carries the full timestamp as text.",
        snippet: `released = 2026-08-02T12:00:00Z`,
      },
      {
        kind: "note",
        title: "Comments disappear",
        body:
          "JSON has no comment syntax, so every # comment is dropped on conversion. If a comment " +
          "carries real information, move it into a data field before converting.",
      },
    ],
    examplesLabel: "Try these",
    examples: [
      {
        title: "Simple config",
        note: "Flat keys map straight to JSON.",
        snippet: `name = "Ada"\nrole = "engineer"\nlevel = 7`,
      },
      {
        title: "Nested tables",
        note: "Tables become nested JSON objects.",
        snippet: `[database]\nhost = "localhost"\nports = [5432, 5433]`,
      },
      {
        title: "Array of tables",
        note: "An array of tables becomes an array of objects.",
        snippet: `[[servers]]\nhost = "a"\nactive = true\n\n[[servers]]\nhost = "b"\nactive = false`,
      },
    ],
  },
  "csv-to-tsv": {
    eyebrow: "Docs · Convert",
    conceptTitle: "Same table, different delimiter",
    concept:
      "CSV → TSV parses a comma-separated table and writes it back with tabs as the delimiter. The " +
      "shared RFC 4180 parser reads quoted fields correctly, so a comma inside a quoted cell is " +
      "preserved as ordinary data (the surrounding quotes are dropped, since a tab delimiter no " +
      "longer needs them). Two things are refused rather than silently corrupted: a rectangular " +
      "grid is required (ragged rows fail with the exact line number), and a field containing a " +
      "newline has no way to stay one cell in TSV — the converter flags it and lets you escape it " +
      "to a literal \\n. Large tables run in a background worker.",
    lead: "before-after",
    itemsLabel: "Common issues & tips",
    items: [
      {
        kind: "error",
        title: "A newline can't live in a TSV cell",
        body:
          "TSV has no way to keep a newline inside one cell — it would split the row. Rather than " +
          "corrupt your table, the converter refuses and points at the cell, or escapes it to a " +
          "literal \\n if you pick that option.",
        snippet: `name,notes\nAda,"line one\nline two"`,
      },
      {
        kind: "error",
        title: "Ragged rows fail",
        body:
          "CSV → TSV needs a rectangular grid. A row with a different number of fields fails with " +
          "the exact line number instead of being silently padded or dropped, which would change " +
          "your data.",
        snippet: `name,role,level\nAda,Engineer,7\nAlan,Engineer`,
      },
      {
        kind: "note",
        title: "Commas inside quotes survive",
        body:
          "The parser reads quoted fields, and since TSV uses tabs the comma becomes ordinary text — " +
          "the surrounding quotes are dropped. A comma in a field never splits the row.",
        snippet: `name,city\n"Turing, Alan",London`,
      },
      {
        kind: "note",
        title: "This direction is the lossy one",
        body:
          "CSV → TSV is the lossy direction when a field contains an embedded newline. The reverse " +
          "(TSV → CSV) is always lossless because CSV quoting can hold anything.",
      },
    ],
    examplesLabel: "Try these",
    examples: [
      {
        title: "Simple table",
        note: "Commas become tabs; the header row is preserved.",
        snippet: `name,role,level\nAda,Engineer,7\nAlan,Engineer,8`,
      },
      {
        title: "Quoted comma",
        note: "The quoted comma stays one cell and the quotes are dropped.",
        snippet: `name,city\n"Turing, Alan",London`,
      },
    ],
  },
  "tsv-to-csv": {
    eyebrow: "Docs · Convert",
    conceptTitle: "The lossless direction",
    concept:
      "TSV → CSV parses a tab-separated table and writes it back as comma-separated values. Because " +
      "CSV quoting can represent commas, double quotes, and even embedded newlines, this conversion " +
      "is lossless: every valid TSV cell survives, and nothing is refused for content reasons. A " +
      "field that contains a comma is wrapped in double quotes so it stays one cell — in TSV a comma " +
      "is ordinary data, while in CSV it's the delimiter. A rectangular grid is still required (a " +
      "ragged row fails with the exact line number rather than being padded or dropped). Large " +
      "tables run in a background worker.",
    lead: "before-after",
    itemsLabel: "Things to know",
    items: [
      {
        kind: "note",
        title: "CSV quoting holds anything",
        body:
          "A field with a comma, a double quote, or even a newline is quoted so it stays one cell. " +
          "Nothing from a valid TSV is dropped or refused — that's what makes this direction lossless.",
        snippet: `name\tcity\n"Turing, Alan"\tLondon`,
      },
      {
        kind: "error",
        title: "Ragged rows fail",
        body:
          "TSV → CSV needs a rectangular grid. A row with a different number of fields fails with the " +
          "exact line number instead of being silently padded or dropped, which would change your data.",
        snippet: `name\trole\tlevel\nAda\tEngineer\t7\nAlan\tEngineer`,
      },
      {
        kind: "note",
        title: "The reverse is the lossy one",
        body:
          "CSV → TSV is the lossy direction (a newline can't live in a TSV cell). TSV → CSV holds " +
          "everything, so the two directions are not symmetric.",
      },
      {
        kind: "note",
        title: "Tabs are the only delimiter",
        body:
          "The input is pinned to a tab delimiter. If your file uses spaces or another separator, " +
          "it's not a TSV — the parser will read it as one broad column and the grid check will catch it.",
      },
    ],
    examplesLabel: "Try these",
    examples: [
      {
        title: "Simple table",
        note: "Tabs become commas; the header row is preserved.",
        snippet: `name\trole\tcity\nAda\tEngineer\tLondon\nAlan\tEngineer\tOxford`,
      },
      {
        title: "Comma in a field",
        note: "TSV is plain; in CSV the field gets quoted so it stays one cell.",
        snippet: `name\tdisplay\nAlan\t"Turing, Alan"`,
      },
    ],
  },
  "fake-json": {
    eyebrow: "Docs · Generate",
    conceptTitle: "A shape in, realistic data out — reproducibly",
    concept:
      "Fake JSON lets you describe a shape with a normal JSON template and faker tokens placed in " +
      "string values — {{name}}, {{email}}, {{int:18..65}}, {{enum:admin|editor|viewer}}, and many " +
      "more. Put a token in a value that is *only* the token and it keeps its real type, so " +
      "\"{{int}}\" becomes a number, not text. Set a count and an optional seed: the same template, " +
      "count, and seed always produce the same records, which makes the output perfect for test " +
      "fixtures and CI. Leave the seed empty for fresh random data each time. Everything runs " +
      "locally, and the readout shows records, size, generation time, and the seed echo.",
    lead: "before-after",
    itemsLabel: "Things to know",
    items: [
      {
        kind: "error",
        title: "An unknown token is left as text",
        body:
          "A token that doesn't match the legend is treated as a literal string — it won't error, " +
          "it just won't expand. Load this and check the template status for the exact message.",
        snippet: `{"id": "{{index1}}", "role": "{{unknown}}"}`,
      },
      {
        kind: "note",
        title: "Token-only values keep their type",
        body:
          "\"{{int:18..65}}\" becomes a real JSON number because the value is only the token. Write " +
          "text around it — \"id-{{int}}\" — and the whole value is a string. The unbox rule is what " +
          "keeps your numbers numeric.",
        snippet: `{"age": "{{int:18..65}}", "label": "id-{{int:1..9}}"}`,
      },
      {
        kind: "note",
        title: "Seeds make output reproducible",
        body:
          "Type any seed and the same template + count + seed always yields the same records — handy " +
          "for fixtures and CI. Leave it empty for fresh random data each time.",
        snippet: `{"name": "{{name}}", "email": "{{email}}"}`,
      },
      {
        kind: "note",
        title: "Nesting is just JSON",
        body:
          "The template is real JSON, so tokens expand anywhere — inside nested objects and arrays. " +
          "For a variable-length array, list the tokens you want; a repeat-count token is on the roadmap.",
        snippet: `{"user": {"name": "{{name}}", "tags": ["{{word}}", "{{word}}"]}}`,
      },
    ],
    examplesLabel: "Try these",
    examples: [
      {
        title: "A user record",
        note: "Names, emails, and a bounded integer — all unboxed to real types.",
        snippet: `{"id": "{{index1}}", "name": "{{name}}", "email": "{{email}}", "age": "{{int:18..65}}", "active": "{{bool}}"}`,
      },
      {
        title: "Enum + dates",
        note: "A role enum and a bounded date keep the data realistic.",
        snippet: `{"role": "{{enum:admin|editor|viewer}}", "joined": "{{date:2021..2024}}", "bio": "{{sentence}}"}`,
      },
    ],
  },
  "uuid-generator": {
    eyebrow: "Docs · Generate",
    conceptTitle: "Not all UUIDs are random",
    concept:
      "A UUID is a 128-bit identifier, and the version you pick decides how those bits are made. " +
      "v4 is fully random — the default for opaque ids. v7 is time-ordered: it puts the most " +
      "significant time bits at the front, so batches come out already sorted and inserts stay " +
      "sequential. v1 is also time-based but stores the low time bits first, so its string order " +
      "doesn't follow time. v5 is deterministic — the same namespace + name always hashes to the " +
      "same id, on any machine. This tool generates all four in your browser using the platform's " +
      "cryptographic RNG (and SHA-1 for v5), with your choice of format (hyphen, compact, braces, " +
      "urn) and case, in bulk up to 5000 per batch.",
    lead: "before-after",
    itemsLabel: "Things to know",
    items: [
      {
        kind: "note",
        title: "v7 batches come out sorted",
        body:
          "Because v7 leads with the most-significant time bits, a batch is already in time order — " +
          "the tool confirms it's monotonic. That's what makes v7 the pick for primary keys you'll " +
          "always insert in order.",
      },
      {
        kind: "note",
        title: "v1 isn't lex-sorted",
        body:
          "v1 stores the low 32 bits of the timestamp first, so string order doesn't follow time. " +
          "That limitation is exactly what v7 was designed to fix.",
      },
      {
        kind: "note",
        title: "v5 is deterministic",
        body:
          "The same namespace + name always hashes to the same UUID, on any machine. Generating a " +
          "batch appends an index to the name so you get distinct ids.",
        snippet: `v5 · namespace DNS · name example.com`,
      },
      {
        kind: "note",
        title: "v3 is intentionally not offered",
        body:
          "v3 uses MD5, which isn't available in Web Crypto; a hand-rolled copy would risk silent " +
          "corruption. v5 (SHA-1) is its correct successor.",
      },
    ],
    examplesLabel: "Try these",
    examples: [
      {
        title: "Opaque ids",
        note: "v4 is fully random — the default for anything that just needs to be unique.",
        snippet: `v4 · count 5 · hyphen · lower`,
      },
      {
        title: "Sortable keys",
        note: "v7 batches come out already time-ordered and monotonic.",
        snippet: `v7 · count 1000 · hyphen · lower`,
      },
      {
        title: "Stable name-based ids",
        note: "Same namespace + name always yields the same identifier.",
        snippet: `v5 · namespace DNS · name example.com`,
      },
    ],
  },
  "base64": {
    eyebrow: "Docs · Encoding",
    conceptTitle: "Text that can cross any transport",
    concept:
      "Base64 encodes data as a compact ASCII alphabet so it survives transports that only carry " +
      "text. Every 3 bytes of input become 4 printable characters, so encoded output is always at " +
      "least ~33% larger than its byte length — more for non-ASCII, since characters like emoji " +
      "expand to several bytes first. The tool encodes and decodes in either the standard alphabet " +
      "(+ /) or the URL-safe one (- _), with optional padding and optional data-URI wrapping. On " +
      "decode it reads the first bytes of the result and names common formats — PNG, JPEG, PDF, GIF, " +
      "WebP, ZIP, gzip — or marks it as JSON or plain text, and shows a byte count for binary " +
      "payloads instead of unreadable characters.",
    lead: "before-after",
    itemsLabel: "Things to know",
    items: [
      {
        kind: "error",
        title: "Not every string is valid Base64",
        body:
          "Decoding rejects characters outside the alphabet and a length that's misaligned. Load this " +
          "and the tool names the problem.",
        snippet: `hello world!!!`,
      },
      {
        kind: "note",
        title: "Standard vs URL-safe",
        body:
          "Standard Base64 uses + and /, which are awkward inside URLs and filenames. URL-safe swaps " +
          "them for - and _ and usually drops the = padding — it's what JWTs and most tokens use.",
        snippet: `a+b/c==`,
      },
      {
        kind: "note",
        title: "Encoding always grows the text",
        body:
          "Every 3 bytes become 4 characters, so encoded output is ~33% larger. The meter shows the " +
          "ratio live — Base64 is for transport, not compression.",
      },
      {
        kind: "note",
        title: "Base64 is not encryption",
        body:
          "It's a trivially reversible encoding, not protection. Anyone with the string can decode it, " +
          "so don't Base64 something sensitive and call it secure.",
      },
    ],
    examplesLabel: "Try these",
    examples: [
      {
        title: "Encode a phrase",
        note: "Switch to Encode and watch a short sentence expand.",
        snippet: `hello world`,
      },
      {
        title: "Decode a token",
        note: "Switch to Decode and the tool names the payload format.",
        snippet: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`,
      },
      {
        title: "URL-safe",
        note: "Pick the URL-safe alphabet and the output swaps + / for - _.",
        snippet: `What is the meaning of life, the universe, and everything?`,
      },
    ],
  },
  "url-encode": {
    eyebrow: "Docs · Encoding",
    conceptTitle: "Three modes, three answers for the same string",
    concept:
      "Percent-encoding escapes the characters that aren't safe in a URL, but the exact set depends " +
      "on where the string is going. Component encodes a single query value or path segment, escaping " +
      "reserved characters so they can't break the URL. Whole URL leaves the structure (/, :, ?, &, =) " +
      "intact and only escapes the unsafe characters. Form encoding uses + for spaces and escapes the " +
      "reserved set — it's what x-www-form-urlencoded bodies use. Non-ASCII always expands to its UTF-8 " +
      "bytes, and the readout reports bytes, not characters, so the expansion number is honest. A " +
      "footprint view shows exactly which characters get encoded, one chip at a time.",
    lead: "before-after",
    itemsLabel: "Things to know",
    items: [
      {
        kind: "error",
        title: "Decode rejects malformed escapes",
        body:
          "A % must be followed by two hex digits; a lone or malformed % is an error. Load this in " +
          "Decode mode and the tool names the problem.",
        snippet: `100% sure`,
      },
      {
        kind: "note",
        title: "Space: %20 or +?",
        body:
          "Component and Whole URL write a space as %20. Form encoding (and many real query strings) " +
          "write it as +. The \"decode + as space\" toggle reads both back correctly.",
        snippet: `a b+c`,
      },
      {
        kind: "note",
        title: "Non-ASCII expands to bytes",
        body:
          "é is two UTF-8 bytes (%C3%A9) and an emoji is four. The byte-based readout makes that " +
          "expansion visible instead of hiding it as character math.",
        snippet: `héllo 😀`,
      },
      {
        kind: "note",
        title: "Pick the mode that matches the destination",
        body:
          "Use Component for a single query value, Whole URL for an entire link, and Form for a form " +
          "body. The wrong mode either over-escapes (breaking structure) or under-escapes (leaving " +
          "unsafe characters).",
      },
    ],
    examplesLabel: "Try these",
    examples: [
      {
        title: "A query value",
        note: "Component encodes the reserved characters so they can't break the URL.",
        snippet: `a & b = c?`,
      },
      {
        title: "A whole link",
        note: "Whole URL keeps the structure and escapes only what's unsafe.",
        snippet: `https://example.com/path?q=hello world&lang=en`,
      },
      {
        title: "A form body",
        note: "Form uses + for spaces and encodes the reserved set.",
        snippet: `name=Ada Lovelace&role=engineer`,
      },
    ],
  },
};

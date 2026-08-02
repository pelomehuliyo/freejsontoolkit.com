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
          "Keys starting with `@` are treated as attributes. For example, `{ \"@id\": \"123\" }` becomes `<element id=\"123\"/>`. " +
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
          "Attributes are stored as `@attributeName`. For example, `<item id=\"1\"/>` becomes `{ \"@id\": \"1\" }`. " +
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
};

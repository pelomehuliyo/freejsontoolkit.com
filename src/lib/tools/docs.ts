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

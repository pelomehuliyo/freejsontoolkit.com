/**
 * Relationship graph between tools. One edge = "after / beside tool X, the user
 * often wants tool Y", with a human label that reads as a call-to-action. This
 * is the single source for the related-tools rail (bite 2) and, later, the
 * comparison pages (bite 4) and the intelligence nudges (bite 5) — build the
 * graph once, read it everywhere.
 *
 *   kind "next" = a natural follow-up step (a verb-led suggestion)
 *   kind "pair" = a sibling you reach for in the same job
 * ids must match the registry `id` field (not the URL slug).
 */
export type RelationKind = "next" | "pair";

export interface Relation {
  id: string;
  label: string;
  kind: RelationKind;
}

export const RELATIONS: Record<string, Relation[]> = {
  "json-formatter": [
    { id: "json-validator", label: "Validate it", kind: "next" },
    { id: "json-minifier", label: "Shrink it", kind: "pair" },
    { id: "json-diff", label: "Compare versions", kind: "pair" },
  ],
  "json-validator": [
    { id: "json-formatter", label: "Fix & format", kind: "next" },
    { id: "json-diff", label: "Compare two docs", kind: "pair" },
    { id: "json-minifier", label: "Then minify", kind: "pair" },
  ],
  "json-diff": [
    { id: "json-formatter", label: "Format a side", kind: "pair" },
    { id: "json-validator", label: "Validate a side", kind: "pair" },
  ],
  "json-minifier": [
    { id: "json-formatter", label: "Pretty-print it", kind: "pair" },
    { id: "json-validator", label: "Validate first", kind: "next" },
  ],
  "json-to-csv": [
    { id: "csv-to-json", label: "Reverse it", kind: "pair" },
    { id: "json-formatter", label: "Format the source", kind: "next" },
  ],
  "csv-to-json": [
    { id: "json-to-csv", label: "Reverse it", kind: "pair" },
    { id: "json-formatter", label: "Format the result", kind: "next" },
    { id: "json-validator", label: "Validate the result", kind: "next" },
  ],
  base64: [
    { id: "url-encode", label: "Percent-encode instead", kind: "pair" },
    { id: "json-validator", label: "Validate decoded JSON", kind: "pair" },
    { id: "jwt-decoder", label: "Decode a JWT", kind: "next" },
  ],
  "uuid-generator": [
    { id: "fake-json", label: "Use them in mock data", kind: "next" },
    { id: "json-formatter", label: "Format the result", kind: "pair" },
  ],
  "fake-json": [
    { id: "json-formatter", label: "Format it", kind: "next" },
    { id: "json-validator", label: "Validate the shape", kind: "pair" },
    { id: "uuid-generator", label: "Add unique ids", kind: "pair" },
  ],
  "url-encode": [
    { id: "base64", label: "Base64 instead", kind: "pair" },
    { id: "json-to-csv", label: "Build a query table", kind: "pair" },
  ],
  "json-to-xml": [
    { id: "xml-to-json", label: "Reverse it", kind: "pair" },
    { id: "json-formatter", label: "Format the source", kind: "next" },
    { id: "json-validator", label: "Validate the source", kind: "pair" },
    { id: "json-to-csv", label: "Or flatten to CSV", kind: "pair" },
  ],
  "regex-tester": [
    { id: "json-validator", label: "Validate structured data", kind: "pair" },
    { id: "base64", label: "Encode the result", kind: "next" },
    { id: "url-encode", label: "Percent-encode it", kind: "pair" },
  ],
  // Add near the other convert tools
  "json-to-xml": [
    { id: "xml-to-json", label: "Reverse it", kind: "pair" },
    { id: "json-formatter", label: "Format the JSON", kind: "next" },
    { id: "json-validator", label: "Validate the JSON", kind: "next" },
  ],
  "xml-to-json": [
    { id: "json-to-xml", label: "Reverse it", kind: "pair" },
    { id: "json-formatter", label: "Format the result", kind: "next" },
    { id: "json-validator", label: "Validate the result", kind: "next" },
    { id: "csv-to-json", label: "Convert CSV instead", kind: "pair" },
  ],
  "json-to-yaml": [
    { id: "yaml-to-json", label: "Reverse it", kind: "pair" },
    { id: "json-formatter", label: "Format the source", kind: "next" },
    { id: "json-validator", label: "Validate the source", kind: "pair" },
  ],
  "yaml-to-json": [
    { id: "json-to-yaml", label: "Reverse it", kind: "pair" },
    { id: "json-formatter", label: "Format the result", kind: "next" },
    { id: "json-validator", label: "Validate the result", kind: "next" },
  ],
  "csv-to-tsv": [
    { id: "tsv-to-csv", label: "Reverse it", kind: "pair" },
    { id: "csv-to-json", label: "Or go to JSON", kind: "pair" },
    { id: "json-to-csv", label: "Flatten JSON instead", kind: "pair" },
  ],
  "tsv-to-csv": [
    { id: "csv-to-tsv", label: "Reverse it", kind: "pair" },
    { id: "csv-to-json", label: "Or go to JSON", kind: "pair" },
  ],
  "toml-to-json": [
    { id: "json-formatter", label: "Format the result", kind: "next" },
    { id: "json-validator", label: "Validate the result", kind: "next" },
    { id: "yaml-to-json", label: "Convert YAML instead", kind: "pair" },
  ],
  "json-to-toml": [
    { id: "toml-to-json", label: "Reverse it", kind: "pair" },
    { id: "json-validator", label: "Validate the source", kind: "next" },
    { id: "json-to-yaml", label: "Or convert to YAML", kind: "pair" },
  ],
  "text-diff": [
    { id: "json-diff", label: "Diff structured JSON", kind: "pair" },
  ],
  "jwt-decoder": [
    { id: "base64", label: "Decode raw Base64", kind: "pair" },
    { id: "json-formatter", label: "Format the payload", kind: "next" },
    { id: "json-validator", label: "Validate the payload", kind: "pair" },
  ],
};

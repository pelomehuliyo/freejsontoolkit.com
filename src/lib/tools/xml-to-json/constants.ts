import type { IndentOption } from "./types";

export const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <user id="1">
    <name>Ada Lovelace</name>
    <email>ada@example.com</email>
    <roles>
      <role>admin</role>
      <role>engineer</role>
    </roles>
  </user>
  <user id="2">
    <name>Alan Turing</name>
    <email>alan@example.com</email>
    <roles>
      <role>engineer</role>
    </roles>
  </user>
</root>`;

export const INDENT_OPTIONS: { value: IndentOption; label: string }[] = [
  { value: "2", label: "2 spaces" },
  { value: "4", label: "4 spaces" },
  { value: "tab", label: "Tab" },
];

export const MAX_INPUT_CHARS = 5_000_000;
// Above this threshold, the conversion runs in a worker (always true here)
export const WORKER_THRESHOLD = 0; // always use worker for safety

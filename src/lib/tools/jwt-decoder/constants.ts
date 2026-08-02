import type { IndentOption } from "./types";

// The canonical jwt.io example token — guaranteed to decode. Load Sample LOADS
// ONLY; the user presses Decode explicitly.
export const SAMPLE_JWT =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
    "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ." +
    "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export const INDENT_OPTIONS: { value: IndentOption; label: string }[] = [
    { value: "2", label: "2 spaces" },
    { value: "4", label: "4 spaces" },
    { value: "tab", label: "Tab" },
];

export const MAX_INPUT_CHARS = 100_000;
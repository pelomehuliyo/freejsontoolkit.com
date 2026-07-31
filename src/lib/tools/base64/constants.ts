import { encodeText } from "./engine";

// Encode sample: a small, readable document.
export const SAMPLE_TEXT = `{
  "toolkit": "Free JSON Toolkit",
  "version": "1.3.0",
  "local": true
}`;

// Decode sample = the Base64 of SAMPLE_TEXT, computed once at load so it is
// guaranteed valid and round-trips coherently (decoding it yields SAMPLE_TEXT
// and the sniffer reports "JSON"). Falls back to a literal only if encoding is
// somehow unavailable at import time.
let SAMPLE_B64 = "eyJ0b29sa2l0IjoiRnJlZSBKU09OIFRvb2xraXQiLCJ2ZXJzaW9uIjoiMS4zLjAiLCJsb2NhbCI6dHJ1ZX0=";
try {
    SAMPLE_B64 = encodeText(SAMPLE_TEXT, {
        variant: "std",
        padding: true,
        dataUri: false,
        mime: "text/plain",
    }).output;
} catch {
    /* keep the literal fallback */
}
export { SAMPLE_B64 };

export const MIME_PRESETS: string[] = [
    "text/plain",
    "application/json",
    "image/png",
    "image/jpeg",
    "image/svg+xml",
    "application/octet-stream",
];

export const MAX_INPUT_CHARS = 15_000_000;

// Live (as-you-type) recompute stops above this so big pastes never hitch the
// UI; past it, the user presses Encode/Decode explicitly.
export const AUTO_RUN_THRESHOLD = 200_000;
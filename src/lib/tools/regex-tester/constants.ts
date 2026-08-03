import type { RegexFlags } from "./types";

// Email matcher — three real matches in the sample text, two decoys.
export const SAMPLE_PATTERN = "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b";

export const SAMPLE_TEST = `Contact us at support@freejsontoolkit.com or sales@example.org.
Invalid: not-an-email @ missing.com
Ada Lovelace — ada@analytical.engine.io`;

export const DEFAULT_FLAGS: RegexFlags = {
    g: true,
    i: false,
    m: false,
    s: false,
    u: false,
    y: false,
};

export const FLAG_ORDER: (keyof RegexFlags)[] = ["g", "i", "m", "s", "u", "y"];

export const FLAG_LABELS: Record<keyof RegexFlags, string> = {
    g: "global",
    i: "ignore case",
    m: "multiline",
    s: "dotall",
    u: "unicode",
    y: "sticky",
};

// Live matching caps here so a pathological pattern on a huge blob can't hitch
// the UI; beyond it we ask for a smaller test string.
export const MAX_TEST_CHARS = 500_000;
// Safety valve against runaway / zero-width global matches.
export const MAX_MATCHES = 10_000;
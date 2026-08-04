import type { ConvertOptions } from "./types";

// A small, rectangular sample with ONE quoted field that contains a comma —
// it survives the tab conversion untouched, and the comma disappears from the
// output because tabs don't need it. Load Sample LOADS ONLY; press Convert.
export const SAMPLE_CSV = `name,role,level
Ada Lovelace,"Engineer, Analyst",7
Alan Turing,"Mathematician, Codebreaker",9
Grace Hopper,"Admiral, Compiler Pioneer",10`;

export const MAX_INPUT_CHARS = 15_000_000;

// Live (main-thread) conversion caps here so big tables never hitch the UI;
// above it, the result arrives via the worker when you press Convert.
export const LIVE_CONVERT_THRESHOLD = 100_000;

export const NEWLINE_STRATEGIES: { value: ConvertOptions["newlineStrategy"]; label: string }[] = [
    { value: "reject", label: "Refuse (honest default)" },
    { value: "escape", label: "Escape to \\n" },
];
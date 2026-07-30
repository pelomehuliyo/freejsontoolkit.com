export interface DiffOptions {
    ignoreWhitespace: boolean;
    ignoreCase: boolean;
}

export interface DiffStats {
    equal: number;
    added: number;
    removed: number;
    changed: number;
    similarity: number; // 0–100, line-based
}

export interface SbsCell {
    n: number | null; // 1-based line number, or null for an empty side
    text: string;
}

export interface SbsRow {
    type: "equal" | "add" | "remove" | "change";
    a: SbsCell | null;
    b: SbsCell | null;
}

export interface UnifiedLine {
    type: "equal" | "add" | "remove";
    na: number | null;
    nb: number | null;
    text: string;
}

export interface DiffResult {
    sbs: SbsRow[];
    unified: UnifiedLine[];
    stats: DiffStats;
    truncated: boolean; // true if the rendered view was capped for safety
}

export type DiffMode = "side" | "unified";

export interface JsonDiffState {
    inputA: string;
    inputB: string;
    result: DiffResult | null;
    mode: DiffMode;
    ignoreWhitespace: boolean;
    ignoreCase: boolean;
    isComparing: boolean;
    needsManual: boolean; // auto-diff skipped because inputs are large
    error: string | null;
}

export const DEFAULT_STATE: JsonDiffState = {
    inputA: "",
    inputB: "",
    result: null,
    mode: "side",
    ignoreWhitespace: false,
    ignoreCase: false,
    isComparing: false,
    needsManual: false,
    error: null,
};
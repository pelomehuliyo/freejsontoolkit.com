export interface RegexFlags {
    g: boolean;
    i: boolean;
    m: boolean;
    s: boolean;
    u: boolean;
    y: boolean;
}

export interface CaptureGroup {
    /** 1-based group number ($1, $2, …) */
    index: number;
    value: string;
}

export interface RegexMatch {
    /** absolute offset in the test string */
    index: number;
    text: string;
    groups: CaptureGroup[];
    namedGroups: Record<string, string>;
}

export interface RegexSegment {
    text: string;
    isMatch: boolean;
}

export interface RegexResult {
    ok: boolean;
    error?: { message: string };
    matches: RegexMatch[];
    /** alternating non-match / match runs, for the highlighted view */
    segments: RegexSegment[];
    /** present only when a replace value is supplied */
    replaced?: string;
    /** true when we stopped early at the match cap */
    truncated: boolean;
    inputSize: number;
}

export interface RegexState {
    pattern: string;
    flags: RegexFlags;
    testInput: string;
    replaceValue: string;
    showReplace: boolean;
    result: RegexResult | null;
    inputStatus: "empty" | "ready";
    error: string | null;
}

export const DEFAULT_STATE: RegexState = {
    pattern: "",
    flags: { g: true, i: false, m: false, s: false, u: false, y: false },
    testInput: "",
    replaceValue: "",
    showReplace: false,
    result: null,
    inputStatus: "empty",
    error: null,
};
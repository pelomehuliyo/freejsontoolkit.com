export interface ConvertOptions {
    /** What to do when the JSON contains null — TOML has no null value. */
    nullStrategy: "reject" | "strip";
}

export interface ConvertStats {
    objects: number;
    arrays: number;
    scalars: number;
    keys: number;
    maxDepth: number;
}

export interface ConvertResult {
    ok: boolean;
    authoritative: boolean;
    output: string;
    error?: { message: string };
    stats?: ConvertStats;
    /** paths of any null values found (populated during detection) */
    nullPaths: string[];
    sourceSize: number;
}

export interface JsonToTomlState {
    jsonInput: string;
    result: ConvertResult | null;
    inputStatus: "empty" | "ready";
    outputStatus: "empty" | "converted" | "invalid";
    isConverting: boolean;
    error: string | null;
    nullStrategy: "reject" | "strip";
}

export const DEFAULT_STATE: JsonToTomlState = {
    jsonInput: "",
    result: null,
    inputStatus: "empty",
    outputStatus: "empty",
    isConverting: false,
    error: null,
    nullStrategy: "reject",
};
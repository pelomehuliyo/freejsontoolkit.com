export interface ConvertResult {
    ok: boolean;
    authoritative: boolean;
    output: string;
    error?: { message: string };
    rowCount: number;
    colCount: number;
    sourceSize: number;
}

export interface TsvToCsvState {
    tsvInput: string;
    result: ConvertResult | null;
    inputStatus: "empty" | "ready";
    outputStatus: "empty" | "converted" | "invalid";
    isConverting: boolean;
    error: string | null;
}

export const DEFAULT_STATE: TsvToCsvState = {
    tsvInput: "",
    result: null,
    inputStatus: "empty",
    outputStatus: "empty",
    isConverting: false,
    error: null,
};
export type IndentOption = "2" | "4" | "tab";

export interface ConverterOptions {
    indent: IndentOption;
}

export interface ConvertStats {
    objects: number;
    arrays: number;
    scalars: number;
    keys: number;
    maxDepth: number;
}

export interface ConvertError {
    message: string;
    line?: number;
    column?: number;
}

export interface ConvertResult {
    ok: boolean;
    authoritative: boolean;
    output: string;
    error?: ConvertError;
    stats?: ConvertStats;
    sourceSize: number;
}

export interface TomlToJsonState {
    tomlInput: string;
    result: ConvertResult | null;
    inputStatus: "empty" | "ready";
    outputStatus: "empty" | "converted" | "invalid";
    isConverting: boolean;
    error: string | null;
    indent: IndentOption;
}

export const DEFAULT_STATE: TomlToJsonState = {
    tomlInput: "",
    result: null,
    inputStatus: "empty",
    outputStatus: "empty",
    isConverting: false,
    error: null,
    indent: "2",
};
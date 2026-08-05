export interface SchemaValidateResult {
    ok: boolean;
    authoritative: boolean;
    errors: SchemaViolation[];
    /** true when more errors exist but were capped */
    truncated: boolean;
    instanceSize: number;
}

export interface SchemaViolation {
    /** JSON Pointer into the instance, "" = root */
    path: string;
    message: string;
}

export interface SchemaLiteState {
    jsonInput: string;
    schemaInput: string;
    result: SchemaValidateResult | null;
    inputStatus: "empty" | "ready";
    outputStatus: "empty" | "valid" | "invalid";
    isValidating: boolean;
    error: string | null;
}

export const DEFAULT_STATE: SchemaLiteState = {
    jsonInput: "",
    schemaInput: "",
    result: null,
    inputStatus: "empty",
    outputStatus: "empty",
    isValidating: false,
    error: null,
};
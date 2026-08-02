export type IndentOption = "2" | "4" | "tab";

export type TimeClaimStatus = "expired" | "valid" | "not-yet-valid" | "active" | "past" | "future";

export interface JwtTimeClaim {
    claim: "iat" | "exp" | "nbf";
    raw: number;
    iso: string;
    /** human-readable status line, e.g. "EXPIRED 6.5y ago" — a TIME fact, never a signature fact */
    detail: string;
    status: TimeClaimStatus;
}

export interface JwtDecodeError {
    message: string;
    segment?: "structure" | "header" | "payload" | "signature";
}

export interface JwtDecodeResult {
    ok: boolean;
    /** explicit Decode = true (drives output + announce); live typing = false */
    authoritative: boolean;
    headerJson?: string;
    payloadJson?: string;
    algorithm?: string;
    typ?: string;
    unsigned?: boolean;
    signatureBase64?: string;
    signatureBytes?: number;
    timeClaims?: JwtTimeClaim[];
    expired?: boolean;
    error?: JwtDecodeError;
    sourceSize: number;
}

export interface JwtDecoderState {
    tokenInput: string;
    result: JwtDecodeResult | null;
    inputStatus: "empty" | "ready";
    outputStatus: "empty" | "valid" | "invalid";
    error: string | null;
    indent: IndentOption;
}

export const DEFAULT_STATE: JwtDecoderState = {
    tokenInput: "",
    result: null,
    inputStatus: "empty",
    outputStatus: "empty",
    error: null,
    indent: "2",
};
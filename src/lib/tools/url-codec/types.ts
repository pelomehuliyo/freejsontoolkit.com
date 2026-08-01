export type UrlMode = "encode" | "decode";
export type UrlEncoding = "component" | "whole" | "form";

export interface UrlCodecOptions {
    mode: UrlMode;
    encoding: UrlEncoding;
    /** decode only: treat '+' as a space before decoding (form/query style) */
    plusSpace: boolean;
}

export interface UrlCodecResult {
    output: string;
    inputChars: number;
    inputBytes: number;
    outputChars: number;
    outputBytes: number;
    ratio: number; // outputBytes / inputBytes * 100, rounded
    valid: boolean;
    error: string | null;
}

export type FootKind = "lit" | "chip" | "err";
export interface FootToken {
    kind: FootKind;
    text: string;
}

export interface UrlValidity {
    ok: boolean;
    message: string;
}

export interface UrlCodecState {
    input: string;
    result: UrlCodecResult | null;
    validity: UrlValidity;
    mode: UrlMode;
    encoding: UrlEncoding;
    plusSpace: boolean;
    isRunning: boolean;
    needsManual: boolean;
    error: string | null;
}

export const DEFAULT_STATE: UrlCodecState = {
    input: "",
    result: null,
    validity: { ok: true, message: "" },
    mode: "encode",
    encoding: "component",
    plusSpace: true,
    isRunning: false,
    needsManual: false,
    error: null,
};
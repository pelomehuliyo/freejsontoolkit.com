export type HmacAlgorithm = "SHA-256" | "SHA-512";
export type HmacEncoding = "hex" | "base64";

export interface HmacState {
    message: string;
    key: string;
    algorithm: HmacAlgorithm;
    encoding: HmacEncoding;
    result: { hex: string; base64: string } | null;
    isRunning: boolean;
    error: string | null;
}

export const DEFAULT_STATE: HmacState = {
    message: "",
    key: "",
    algorithm: "SHA-256",
    encoding: "hex",
    result: null,
    isRunning: false,
    error: null,
};
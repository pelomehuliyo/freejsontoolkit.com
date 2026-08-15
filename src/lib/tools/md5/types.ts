export type HashEncoding = "hex" | "base64";

export interface Md5State {
    input: string;
    encoding: HashEncoding;
    result: { hex: string; base64: string } | null;
    isRunning: boolean;
    error: string | null;
}

export const DEFAULT_STATE: Md5State = {
    input: "",
    encoding: "hex",
    result: null,
    isRunning: false,
    error: null,
};
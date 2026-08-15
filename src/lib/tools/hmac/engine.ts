import { hmac, textToBytes } from "../crypto/hasher";
import { toHex, toBase64 } from "../crypto/encoder";
import type { HmacAlgorithm } from "./types";

export interface HmacResult {
    hex: string;
    base64: string;
}

/**
 * Pure engine for HMAC.
 * Uses the shared crypto floor (native Web Crypto importKey + sign).
 */
export async function run(message: string, key: string, algorithm: HmacAlgorithm): Promise<HmacResult> {
    if (!message.trim()) {
        throw new Error("Message is empty. Paste the message to authenticate.");
    }
    if (!key.trim()) {
        throw new Error("Secret key is empty. Enter the shared secret key.");
    }

    const msgBytes = textToBytes(message);
    const keyBytes = textToBytes(key);
    const out = await hmac(algorithm, msgBytes, keyBytes);

    return {
        hex: toHex(out),
        base64: toBase64(out),
    };
}
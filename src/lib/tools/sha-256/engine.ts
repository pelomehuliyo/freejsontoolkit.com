import { hash, textToBytes } from "../crypto/hasher";
import { toHex, toBase64 } from "../crypto/encoder";

export interface Sha256Result {
    hex: string;
    base64: string;
}

/**
 * Pure engine for SHA-256.
 * Uses the shared crypto floor (Web Crypto API).
 */
export async function run(input: string): Promise<Sha256Result> {
    if (!input.trim()) {
        throw new Error("Input is empty. Paste text to hash.");
    }

    const bytes = textToBytes(input);
    const hashBytes = await hash("SHA-256", bytes);

    return {
        hex: toHex(hashBytes),
        base64: toBase64(hashBytes),
    };
}
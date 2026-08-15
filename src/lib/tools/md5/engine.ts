import { hash, textToBytes } from "../crypto/hasher";
import { toHex, toBase64 } from "../crypto/encoder";

export interface Md5Result {
    hex: string;
    base64: string;
}

/**
 * Pure engine for MD5.
 * Uses the shared crypto floor (local MD5 implementation).
 */
export async function run(input: string): Promise<Md5Result> {
    if (!input.trim()) {
        throw new Error("Input is empty. Paste text to hash.");
    }

    const bytes = textToBytes(input);
    const hashBytes = await hash("MD5", bytes);

    return {
        hex: toHex(hashBytes),
        base64: toBase64(hashBytes),
    };
}
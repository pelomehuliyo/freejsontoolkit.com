import { md5 } from "./md5";

export type HashAlgorithm = "SHA-256" | "SHA-512" | "MD5";

/**
 * Unified hashing wrapper.
 * Uses native Web Crypto for SHA (fast, secure) and the bundled MD5 for legacy support.
 */
export async function hash(algo: HashAlgorithm, data: Uint8Array): Promise<Uint8Array> {
    if (algo === "MD5") {
        return md5(data);
    }
    // Web Crypto API is available in modern browsers and workers
    const buffer = await crypto.subtle.digest(algo, data.slice());
    return new Uint8Array(buffer);
}

/** Helper to convert string input to Uint8Array */
export function textToBytes(text: string): Uint8Array {
    return new TextEncoder().encode(text);
}

/**
 * HMAC with a shared secret key.
 * Uses native Web Crypto (importKey + sign). MD5 is not supported for HMAC
 * by Web Crypto, so algorithms are the SHA family only.
 */
export async function hmac(
    algo: "SHA-256" | "SHA-512",
    data: Uint8Array,
    key: Uint8Array,
): Promise<Uint8Array> {
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        key.slice(),
        { name: "HMAC", hash: algo },
        false,
        ["sign"],
    );
    const buffer = await crypto.subtle.sign("HMAC", cryptoKey, data.slice());
    return new Uint8Array(buffer);
}
/**
 * Crypto Encoders — Hex and Base64 for hash output.
 * Pure JS, worker-safe, no dependencies.
 */

const HEX_CHARS = "0123456789abcdef";

export function toHex(bytes: Uint8Array): string {
    let hex = "";
    for (let i = 0; i < bytes.length; i++) {
        const b = bytes[i];
        hex += HEX_CHARS[b >> 4] + HEX_CHARS[b & 0x0f];
    }
    return hex;
}

export function toBase64(bytes: Uint8Array): string {
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    // btoa is available in workers and main thread
    return btoa(binary);
}

export function fromHex(hex: string): Uint8Array {
    const clean = hex.replace(/[^0-9a-fA-F]/g, "");
    if (clean.length % 2 !== 0) throw new Error("Invalid hex string length");
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
    }
    return bytes;
}
/**
 * Compact MD5 Implementation (Public Domain / RSA Data Security logic).
 * Used only for the legacy MD5 tool.
 */

export function md5(bytes: Uint8Array): Uint8Array {
    // Convert byte array to word array for processing
    const words: number[] = [];
    for (let i = 0; i < bytes.length; i++) {
        words[i >> 2] |= bytes[i] << ((i % 4) * 8);
    }
    words[bytes.length >> 2] |= 0x80 << ((bytes.length % 4) * 8);

    const bitLen = bytes.length * 8;
    words[(((bytes.length + 8) >> 6) + 1) * 16 - 2] = bitLen;
    words[(((bytes.length + 8) >> 6) + 1) * 16 - 1] = 0; // High bits (0 for < 512MB)

    let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;

    const S = [
        7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
        5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
        4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
        6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
    ];

    const K = new Uint32Array(64);
    for (let i = 0; i < 64; i++) {
        K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000);
    }

    for (let i = 0; i < words.length; i += 16) {
        const f = 0, g = 0; // placeholders for logic flow
        const aa = a, bb = b, cc = c, dd = d;

        for (let j = 0; j < 64; j++) {
            let f_val, g_val;
            if (j < 16) { f_val = (b & c) | (~b & d); g_val = j; }
            else if (j < 32) { f_val = (d & b) | (~d & c); g_val = (5 * j + 1) % 16; }
            else if (j < 48) { f_val = b ^ c ^ d; g_val = (3 * j + 5) % 16; }
            else { f_val = c ^ (b | ~d); g_val = (7 * j) % 16; }

            const temp = d;
            d = c;
            c = b;
            const rot = (x: number, c: number) => (x << c) | (x >>> (32 - c));
            b = b + rot((a + f_val + K[j] + words[i + g_val]), S[j]);
            a = temp;
        }
        a += aa; b += bb; c += cc; d += dd;
    }

    // Convert back to bytes (Little Endian)
    const result = new Uint8Array(16);
    const view = new DataView(result.buffer);
    view.setUint32(0, a, true);
    view.setUint32(4, b, true);
    view.setUint32(8, c, true);
    view.setUint32(12, d, true);
    return result;
}
/**
 * Base64 — engine.
 *
 * A hand-rolled codec (not btoa/atob) so UTF-8 round-trips losslessly — btoa
 * throws on non-Latin-1, which silently breaks emoji/CJK. On top of the codec:
 *   - standard AND url-safe alphabets, with optional padding;
 *   - a content-sensitive expansion ratio (output length vs the input the user
 *     actually sees in the box), so the meter moves with the data;
 *   - a magic-byte sniffer that names binary payloads (PNG/JPEG/…) and a
 *     text/JSON/SVG classifier, so decode can say *what* it decoded;
 *   - binary payloads render as a clean placeholder, never replacement chars.
 *
 * Pure: no DOM, no store, no browser APIs. Safe in a Web Worker.
 */
import type { Base64Mode, Base64Options, Base64Result } from "./types";

const STD = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const URL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function alphabet(variant: Base64Options["variant"]): string {
  return variant === "url" ? URL : STD;
}

// decode lookup tables, built once per alphabet
const tables: Record<string, Int8Array> = {};
function decodeTable(alpha: string): Int8Array {
  if (tables[alpha]) return tables[alpha];
  const t = new Int8Array(128).fill(-1);
  for (let i = 0; i < 64; i++) t[alpha.charCodeAt(i)] = i;
  tables[alpha] = t;
  return t;
}

function isWs(c: string): boolean {
  return c === " " || c === "\n" || c === "\r" || c === "\t";
}

function encodeBytes(bytes: Uint8Array, alpha: string, pad: boolean): string {
  const n = bytes.length;
  const out: string[] = [];
  let buf = "";
  for (let i = 0; i < n; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < n ? bytes[i + 1] : 0;
    const b2 = i + 2 < n ? bytes[i + 2] : 0;
    const have1 = i + 1 < n;
    const have2 = i + 2 < n;
    buf += alpha[(b0 >> 2) & 63];
    buf += alpha[((b0 << 4) | (b1 >> 4)) & 63];
    buf += have1 ? alpha[((b1 << 2) | (b2 >> 6)) & 63] : pad ? "=" : "";
    buf += have2 ? alpha[b2 & 63] : pad ? "=" : "";
    if (buf.length >= 16384) {
      out.push(buf);
      buf = "";
    }
  }
  if (buf) out.push(buf);
  return out.join("");
}

function decodeString(str: string, alpha: string): Uint8Array {
  const t = decodeTable(alpha);
  // strip whitespace, remember we report the offending *character* on error
  let s = "";
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (isWs(c)) continue;
    s += c;
  }
  // peel padding
  let padCount = 0;
  while (s.length > 0 && s[s.length - 1] === "=") {
    padCount++;
    s = s.slice(0, -1);
  }
  // validate charset
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code >= 128 || t[code] === -1) {
      throw new Error(`Invalid character ${JSON.stringify(s[i])} at position ${i + 1}`);
    }
  }
  const rem = s.length % 4;
  if (rem === 1) throw new Error("Incomplete base64 group (1 trailing character)");
  if (padCount > 0 && (s.length + padCount) % 4 !== 0) {
    throw new Error("Incorrect base64 padding");
  }
  const groups = (s.length - rem) / 4;
  const tailBytes = rem === 2 ? 1 : rem === 3 ? 2 : 0;
  const out = new Uint8Array(groups * 3 + tailBytes);
  let o = 0;
  let p = 0;
  for (let g = 0; g < groups; g++) {
    const v =
      (t[s.charCodeAt(p)] << 18) |
      (t[s.charCodeAt(p + 1)] << 12) |
      (t[s.charCodeAt(p + 2)] << 6) |
      t[s.charCodeAt(p + 3)];
    out[o++] = (v >> 16) & 255;
    out[o++] = (v >> 8) & 255;
    out[o++] = v & 255;
    p += 4;
  }
  if (rem === 2) {
    const v = (t[s.charCodeAt(p)] << 18) | (t[s.charCodeAt(p + 1)] << 12);
    out[o++] = (v >> 16) & 255;
  } else if (rem === 3) {
    const v =
      (t[s.charCodeAt(p)] << 18) | (t[s.charCodeAt(p + 1)] << 12) | (t[s.charCodeAt(p + 2)] << 6);
    out[o++] = (v >> 16) & 255;
    out[o++] = (v >> 8) & 255;
  }
  return out;
}

/** Cheap, decode-free validity check for the live status bar. */
export function isBase64(str: string, variant: Base64Options["variant"]): boolean {
  const t = decodeTable(alphabet(variant));
  let len = 0;
  let pad = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (isWs(c)) continue;
    if (c === "=") {
      pad++;
      len++;
      continue;
    }
    const code = c.charCodeAt(0);
    if (code >= 128 || t[code] === -1) return false;
    len++;
  }
  if (len === 0) return false;
  if (len % 4 === 1) return false;
  return true;
}

function sniffBytes(b: Uint8Array): string | null {
  const at = (i: number): number => (i < b.length ? b[i] : -1);
  if (b.length >= 8 && at(0) === 0x89 && at(1) === 0x50 && at(2) === 0x4e && at(3) === 0x47)
    return "PNG image";
  if (b.length >= 3 && at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff) return "JPEG image";
  if (b.length >= 4 && at(0) === 0x47 && at(1) === 0x49 && at(2) === 0x46 && at(3) === 0x38)
    return "GIF image";
  if (b.length >= 4 && at(0) === 0x25 && at(1) === 0x50 && at(2) === 0x44 && at(3) === 0x46)
    return "PDF document";
  if (
    b.length >= 12 &&
    at(0) === 0x52 &&
    at(1) === 0x49 &&
    at(2) === 0x46 &&
    at(3) === 0x46 &&
    at(8) === 0x57 &&
    at(9) === 0x45 &&
    at(10) === 0x42 &&
    at(11) === 0x50
  )
    return "WebP image";
  if (b.length >= 4 && at(0) === 0x50 && at(1) === 0x4b && at(2) === 0x03 && at(3) === 0x04)
    return "ZIP archive";
  if (b.length >= 2 && at(0) === 0x1f && at(1) === 0x8b) return "gzip stream";
  return null;
}

export function encodeText(input: string, opts: Base64Options): Base64Result {
  const bytes = new TextEncoder().encode(input);
  const b64 = encodeBytes(bytes, alphabet(opts.variant), opts.padding);
  const output = opts.dataUri ? `data:${opts.mime};base64,${b64}` : b64;
  const ratio = input.length ? Math.round((b64.length / input.length) * 100) : 0;
  return {
    output,
    inputChars: input.length,
    inputBytes: bytes.length,
    outputChars: output.length,
    outputBytes: 0,
    ratio,
    looksLike: null,
    binary: false,
  };
}

export function decodeText(input: string, opts: Base64Options): Base64Result {
  const bytes = decodeString(input, alphabet(opts.variant));
  const magic = sniffBytes(bytes);
  let looksLike = magic;
  let binary = false;
  let decodedText: string | null = null;

  try {
    decodedText = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    binary = true;
  }

  if (!binary) {
    const trimmed = (decodedText as string).trimStart();
    const first = trimmed[0];
    if (first === "{" || first === "[") {
      try {
        JSON.parse(decodedText as string);
        looksLike = "JSON";
      } catch {
        looksLike = looksLike ?? "text";
      }
    } else if (/^<\?xml/i.test(trimmed) || /^<svg[\s>]/i.test(trimmed)) {
      looksLike = "SVG / XML";
    } else if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(decodedText as string)) {
      binary = true;
      looksLike = looksLike ?? "binary";
    } else {
      looksLike = looksLike ?? "text";
    }
  } else if (!looksLike) {
    looksLike = "binary";
  }

  const output = binary
    ? `[binary content — ${bytes.length.toLocaleString()} bytes]`
    : (decodedText as string);
  const ratio = input.length ? Math.round((bytes.length / input.length) * 100) : 0;
  return {
    output,
    inputChars: input.length,
    inputBytes: 0,
    outputChars: binary ? 0 : (decodedText as string).length,
    outputBytes: bytes.length,
    ratio,
    looksLike,
    binary,
  };
}

export function run(mode: Base64Mode, input: string, opts: Base64Options): Base64Result {
  return mode === "encode" ? encodeText(input, opts) : decodeText(input, opts);
}

/**
 * JWT Decoder — engine. DECODE ONLY, NEVER VERIFY.
 *
 * There is no secret or public key here, and implying verification would be
 * dangerous. We base64url-decode the header and payload, surface the signature
 * bytes, interpret exp/iat/nbf as human dates (a TIME fact, not a signature
 * fact), and say loudly that nothing was checked. alg:"none" is called out as
 * unsigned. Pure: no DOM, no store. Bounded + fast, so it runs on the main
 * thread (no worker — per convention).
 */
import type { JwtDecodeError, JwtDecodeResult, JwtTimeClaim, TimeClaimStatus } from "./types";

function base64UrlToBytes(seg: string): Uint8Array {
    const b64 = seg.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const bin = atob(padded);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
}

function decodeSegment(seg: string): { obj?: unknown; error?: "base64" | "json" } {
    let bytes: Uint8Array;
    try {
        bytes = base64UrlToBytes(seg);
    } catch {
        return { error: "base64" };
    }
    try {
        return { obj: JSON.parse(new TextDecoder().decode(bytes)) };
    } catch {
        return { error: "json" };
    }
}

function relative(ms: number, now: number): string {
    const s = Math.floor(Math.abs(now - ms) / 1000);
    if (s < 60) return s + "s";
    const m = Math.floor(s / 60);
    if (m < 60) return m + "m";
    const h = Math.floor(m / 60);
    if (h < 24) return h + "h";
    const d = Math.floor(h / 24);
    if (d < 365) return d + "d";
    return (d / 365).toFixed(1) + "y";
}

function fmt(ms: number): string {
    return new Date(ms).toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC");
}

function interpret(claim: "iat" | "exp" | "nbf", raw: number, now: number): JwtTimeClaim {
    const ms = raw * 1000;
    let status: TimeClaimStatus;
    let detail: string;
    if (claim === "exp") {
        status = now > ms ? "expired" : "valid";
        detail = status === "expired" ? `EXPIRED ${relative(ms, now)} ago` : `valid for ${relative(ms, now)}`;
    } else if (claim === "nbf") {
        status = now < ms ? "not-yet-valid" : "active";
        detail = status === "not-yet-valid" ? `not valid for ${relative(ms, now)}` : "active now";
    } else {
        status = now < ms ? "future" : "past";
        detail = status === "future" ? "issued in the future (clock skew?)" : `issued ${relative(ms, now)} ago`;
    }
    return { claim, raw, iso: fmt(ms), detail, status };
}

export function decodeJwt(input: string, indent: string): JwtDecodeResult {
    const sourceSize = input.length;
    const fail = (message: string, segment?: JwtDecodeError["segment"]): JwtDecodeResult => ({
        ok: false,
        authoritative: false,
        sourceSize,
        error: { message, segment },
    });

    const cleaned = input.trim().replace(/^Bearer\s+/i, "").replace(/\s+/g, "");
    if (!cleaned) return fail("Empty input");

    const parts = cleaned.split(".");
    if (parts.length !== 3) {
        return fail(
            `A JWT has exactly 3 dot-separated segments (header.payload.signature) — this has ${parts.length}.`,
            "structure",
        );
    }

    const header = decodeSegment(parts[0]);
    if (header.error) {
        return fail(
            header.error === "base64"
                ? "The header segment isn't valid base64url."
                : "The header decoded but isn't valid JSON.",
            "header",
        );
    }
    const payload = decodeSegment(parts[1]);
    if (payload.error) {
        return fail(
            payload.error === "base64"
                ? "The payload segment isn't valid base64url."
                : "The payload decoded but isn't valid JSON.",
            "payload",
        );
    }

    let signatureBytes = 0;
    if (parts[2].length > 0) {
        try {
            signatureBytes = base64UrlToBytes(parts[2]).length;
        } catch {
            return fail("The signature segment isn't valid base64url.", "signature");
        }
    }

    const h = header.obj as Record<string, unknown>;
    const p = payload.obj as Record<string, unknown>;
    const algorithm = typeof h.alg === "string" ? h.alg : undefined;
    const typ = typeof h.typ === "string" ? h.typ : undefined;
    const unsigned = algorithm?.toLowerCase() === "none" && parts[2].length === 0;

    const now = Date.now();
    const timeClaims: JwtTimeClaim[] = [];
    for (const claim of ["iat", "exp", "nbf"] as const) {
        const v = p[claim];
        if (typeof v === "number" && Number.isFinite(v)) timeClaims.push(interpret(claim, v, now));
    }
    const expired = timeClaims.some((c) => c.claim === "exp" && c.status === "expired");

    const pad = indent === "tab" ? "\t" : Number(indent);
    return {
        ok: true,
        authoritative: false,
        sourceSize,
        headerJson: JSON.stringify(header.obj, null, pad),
        payloadJson: JSON.stringify(payload.obj, null, pad),
        algorithm,
        typ,
        unsigned,
        signatureBase64: parts[2],
        signatureBytes,
        timeClaims,
        expired,
    };
}

/** Pure presentation: the mono readout. The "NOT VERIFIED" line is non-negotiable. */
export function buildOutput(r: JwtDecodeResult): string {
    if (!r.ok) {
        const seg = r.error?.segment ? `  segment: ${r.error.segment}` : "";
        return ["✗ Not a decodable JWT", "", "  " + (r.error?.message ?? "Unknown error"), seg].join("\n");
    }
    const leader = (label: string, val: string): string => {
        const dots = ".".repeat(Math.max(2, 34 - label.length - val.length));
        return `  ${label} ${dots} ${val}`;
    };
    const out: string[] = ["◈ DECODED — SIGNATURE NOT VERIFIED", ""];
    if (r.algorithm) out.push(leader("algorithm", r.algorithm));
    if (r.typ) out.push(leader("type", r.typ));
    if (r.unsigned) {
        out.push("");
        out.push("  ⚠ alg is \"none\" — this token is UNSIGNED. Anyone could have made it.");
    }
    out.push("", "── header ──", r.headerJson ?? "", "", "── payload ──", r.payloadJson ?? "");
    if (r.timeClaims && r.timeClaims.length > 0) {
        out.push("", "── time claims (time facts, not signature facts) ──");
        for (const c of r.timeClaims) {
            out.push(leader(c.claim, `${c.iso}  ·  ${c.detail}`));
        }
    }
    out.push("", "── signature ──");
    out.push(
        r.signatureBase64
            ? leader(`${r.signatureBytes} bytes`, "NOT CHECKED (no key here)")
            : leader("absent", "NOT CHECKED"),
    );
    if (r.signatureBase64) out.push("  " + r.signatureBase64);
    out.push(
        "",
        "  ⚠ Decoding is not verification. Anyone can base64-encode a payload;",
        "    only the holder of the signing key can prove this token is authentic.",
        "    This page has no key.",
    );
    return out.join("\n");
}
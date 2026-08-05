/**
 * Text Diff — engine.
 *
 * A line-based diff that is correct AND bounded — the same algorithm the JSON
 * Diff tool ships on (it was always line-based; the "JSON" there is branding,
 * not parsing). Here it serves any text: logs, configs, code, markdown, env,
 * SQL. Steps:
 *   1. split both inputs into lines;
 *   2. build compare-keys per line (respecting ignoreWhitespace / ignoreCase);
 *   3. trim the common prefix and common suffix (so a typical "a few lines
 *      changed in the middle" edit reduces to a tiny core);
 *   4. run a textbook LCS (DP) on the core — but only if the core is small
 *      enough to fit a bounded table; otherwise fall back to a coarse
 *      block-diff (honest, and it cannot OOM the way an unbounded diff can);
 *   5. zip adjacent delete/insert runs so changed lines FACE each other in the
 *      side-by-side view, and emit a unified view + live stats.
 *
 * Pure: no DOM, no store, no browser APIs. Safe in a Web Worker.
 */
import type { DiffOptions, DiffResult, DiffStats, SbsRow, UnifiedLine } from "./types";

// Bounded DP table (entries). Above this we use the coarse fallback.
const DP_CAP = 4_000_000;
// Cap rendered rows so a pathological manual compare can't build a huge DOM.
export const RENDER_CAP = 20_000;

function splitLines(s: string): string[] {
    if (s.length === 0) return [];
    const lines = s.split("\n");
    // drop a single trailing empty element caused by a final newline
    if (lines.length > 0 && lines[lines.length - 1] === "" && s.endsWith("\n")) lines.pop();
    return lines;
}

function key(line: string, opts: DiffOptions): string {
    let s = line;
    if (opts.ignoreWhitespace) s = s.replace(/\s+/g, "");
    if (opts.ignoreCase) s = s.toLowerCase();
    return s;
}

type Edit =
    | { op: "equal"; a: number; b: number }
    | { op: "delete"; a: number }
    | { op: "insert"; b: number };

/** LCS-based edit script over compare-key arrays. Standard DP + backtrack. */
function lcsEdits(ka: string[], kb: string[]): Edit[] {
    const N = ka.length;
    const M = kb.length;
    const W = M + 1;
    const dp = new Uint32Array((N + 1) * W);
    for (let i = 1; i <= N; i++) {
        const row = i * W;
        const prev = row - W;
        for (let j = 1; j <= M; j++) {
            if (ka[i - 1] === kb[j - 1]) dp[row + j] = dp[prev + j - 1] + 1;
            else dp[row + j] = dp[prev + j] >= dp[row + j - 1] ? dp[prev + j] : dp[row + j - 1];
        }
    }
    const edits: Edit[] = [];
    let i = N;
    let j = M;
    while (i > 0 && j > 0) {
        if (ka[i - 1] === kb[j - 1]) {
            edits.push({ op: "equal", a: i - 1, b: j - 1 });
            i--;
            j--;
        } else if (dp[(i - 1) * W + j] >= dp[i * W + j - 1]) {
            edits.push({ op: "delete", a: i - 1 });
            i--;
        } else {
            edits.push({ op: "insert", b: j - 1 });
            j--;
        }
    }
    while (i > 0) {
        edits.push({ op: "delete", a: i - 1 });
        i--;
    }
    while (j > 0) {
        edits.push({ op: "insert", b: j - 1 });
        j--;
    }
    edits.reverse();
    return edits;
}

export function computeDiff(aStr: string, bStr: string, opts: DiffOptions): DiffResult {
    const aLines = splitLines(aStr);
    const bLines = splitLines(bStr);
    const ka = aLines.map((l) => key(l, opts));
    const kb = bLines.map((l) => key(l, opts));

    // common prefix
    let p = 0;
    while (p < ka.length && p < kb.length && ka[p] === kb[p]) p++;
    // common suffix (don't cross the prefix)
    let sa = ka.length - 1;
    let sb = kb.length - 1;
    while (sa > p && sb > p && ka[sa] === kb[sb]) {
        sa--;
        sb--;
    }

    const mA = sa - p + 1;
    const mB = sb - p + 1;
    let mid: Edit[];

    if (mA <= 0 || mB <= 0) {
        // one side's middle is empty → the other side's middle is pure add/remove
        mid = [];
        if (mA > 0) for (let i = 0; i < mA; i++) mid.push({ op: "delete", a: p + i });
        else if (mB > 0) for (let j = 0; j < mB; j++) mid.push({ op: "insert", b: p + j });
    } else if ((mA + 1) * (mB + 1) > DP_CAP) {
        // core too big for a bounded table → coarse, honest fallback
        mid = [];
        for (let i = 0; i < mA; i++) mid.push({ op: "delete", a: p + i });
        for (let j = 0; j < mB; j++) mid.push({ op: "insert", b: p + j });
    } else {
        const local = lcsEdits(ka.slice(p, p + mA), kb.slice(p, p + mB));
        mid = local.map((e) =>
            e.op === "equal"
                ? { op: "equal" as const, a: p + e.a, b: p + e.b }
                : e.op === "delete"
                    ? { op: "delete" as const, a: p + e.a }
                    : { op: "insert" as const, b: p + e.b },
        );
    }

    // assemble full edit stream: prefix equals + middle + suffix equals
    const edits: Edit[] = [];
    for (let i = 0; i < p; i++) edits.push({ op: "equal", a: i, b: i });
    for (const e of mid) edits.push(e);
    const sufCount = aLines.length - (sa + 1);
    for (let k = 0; k < sufCount; k++) edits.push({ op: "equal", a: sa + 1 + k, b: sb + 1 + k });

    // walk edits → side-by-side rows (zipped) + unified lines + stats
    const sbs: SbsRow[] = [];
    const unified: UnifiedLine[] = [];
    let eq = 0;
    let del = 0;
    let ins = 0;
    let changed = 0;
    let i = 0;

    while (i < edits.length) {
        const e = edits[i];
        if (e.op === "equal") {
            sbs.push({
                type: "equal",
                a: { n: e.a + 1, text: aLines[e.a] },
                b: { n: e.b + 1, text: bLines[e.b] },
            });
            unified.push({ type: "equal", na: e.a + 1, nb: e.b + 1, text: aLines[e.a] });
            eq++;
            i++;
        } else {
            const dels: { a: number }[] = [];
            const inss: { b: number }[] = [];
            while (i < edits.length && edits[i].op !== "equal") {
                const x = edits[i];
                if (x.op === "delete") dels.push({ a: x.a });
                else inss.push({ b: (x as { b: number }).b });
                i++;
            }
            del += dels.length;
            ins += inss.length;
            changed += Math.min(dels.length, inss.length);
            const n = Math.max(dels.length, inss.length);
            for (let k = 0; k < n; k++) {
                const da = dels[k];
                const ib = inss[k];
                if (da && ib) {
                    sbs.push({
                        type: "change",
                        a: { n: da.a + 1, text: aLines[da.a] },
                        b: { n: ib.b + 1, text: bLines[ib.b] },
                    });
                } else if (da) {
                    sbs.push({ type: "remove", a: { n: da.a + 1, text: aLines[da.a] }, b: null });
                } else {
                    sbs.push({ type: "add", a: null, b: { n: ib!.b + 1, text: bLines[ib!.b] } });
                }
            }
            for (const da of dels)
                unified.push({ type: "remove", na: da.a + 1, nb: null, text: aLines[da.a] });
            for (const ib of inss)
                unified.push({ type: "add", na: null, nb: ib.b + 1, text: bLines[ib.b] });
        }
    }

    let truncated = false;
    if (sbs.length > RENDER_CAP) {
        sbs.length = RENDER_CAP;
        truncated = true;
    }
    if (unified.length > RENDER_CAP) {
        unified.length = RENDER_CAP;
        truncated = true;
    }

    const total = eq + del + ins;
    const stats: DiffStats = {
        equal: eq,
        added: ins,
        removed: del,
        changed,
        similarity: total ? Math.round((eq / total) * 100) : 100,
    };

    return { sbs, unified, stats, truncated };
}
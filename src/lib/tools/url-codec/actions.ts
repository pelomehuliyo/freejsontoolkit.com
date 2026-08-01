import type { Store } from "../../state/toolStore";
import type { UrlCodecResult, UrlCodecState, UrlEncoding, UrlMode } from "./types";
import { run, validate } from "./engine";
import { AUTO_THRESHOLD, MAX_INPUT_CHARS, SAMPLE_TEXT } from "./constants";

function validityFor(s: UrlCodecState): UrlCodecState["validity"] {
    if (s.mode !== "decode") return { ok: true, message: "" };
    if (s.input.trim() === "") return { ok: true, message: "" };
    return validate(s.input, s.encoding, s.plusSpace);
}

export function setInput(store: Store<UrlCodecState>, text: string): void {
    store.update((s) => {
        const next = { ...s, input: text, error: null };
        next.validity = validityFor(next);
        return next;
    });
}
export function setMode(store: Store<UrlCodecState>, mode: UrlMode): void {
    store.update((s) => {
        const next = { ...s, mode, error: null };
        next.validity = validityFor(next);
        return next;
    });
}
export function setEncoding(store: Store<UrlCodecState>, encoding: UrlEncoding): void {
    store.update((s) => {
        const next = { ...s, encoding, error: null };
        next.validity = validityFor(next);
        return next;
    });
}
export function setPlusSpace(store: Store<UrlCodecState>, plusSpace: boolean): void {
    store.update((s) => {
        const next = { ...s, plusSpace, error: null };
        next.validity = validityFor(next);
        return next;
    });
}

export function clearAll(store: Store<UrlCodecState>): void {
    store.update((s) => ({
        ...s,
        input: "",
        result: null,
        validity: { ok: true, message: "" },
        needsManual: false,
        error: null,
    }));
}

/** Recompute. Live calls pass forced=false and skip work above the threshold
 *  or, in decode mode, while the input isn't valid percent-encoding (so the
 *  error banner doesn't flicker on every keystroke). Explicit button / option /
 *  mode changes pass forced=true. */
export function transform(store: Store<UrlCodecState>, forced = false): void {
    const s = store.get();
    if (s.isRunning) return;

    if (s.input.length === 0) {
        store.update((x) => ({ ...x, result: null, needsManual: false }));
        return;
    }
    if (s.input.length > MAX_INPUT_CHARS) {
        store.update((x) => ({
            ...x,
            error: "Input too large. Limit is " + MAX_INPUT_CHARS.toLocaleString() + " chars.",
        }));
        return;
    }
    if (!forced) {
        if (s.input.length > AUTO_THRESHOLD) {
            store.update((x) => ({ ...x, needsManual: true }));
            return;
        }
        if (s.mode === "decode" && !s.validity.ok) {
            store.update((x) => ({ ...x, result: null, needsManual: false }));
            return;
        }
    }

    store.update((x) => ({ ...x, isRunning: true, needsManual: false, error: null }));
    queueMicrotask(() => {
        try {
            const result: UrlCodecResult = run(s.input, {
                mode: s.mode,
                encoding: s.encoding,
                plusSpace: s.plusSpace,
            });
            store.update((x) => ({
                ...x,
                isRunning: false,
                result,
                error: result.error,
                validity: result.valid ? { ok: true, message: "" } : { ok: false, message: result.error ?? "Invalid" },
            }));
        } catch (err) {
            store.update((x) => ({
                ...x,
                isRunning: false,
                error: err instanceof Error ? err.message : "Operation failed.",
            }));
        }
    });
}

export function loadSample(store: Store<UrlCodecState>): void {
    store.update((s) => {
        const next = { ...s, input: SAMPLE_TEXT, error: null };
        next.validity = validityFor(next);
        return next;
    });
    transform(store, true);
}
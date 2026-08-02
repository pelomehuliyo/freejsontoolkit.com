import type { Store } from "../../state/toolStore";
import type { JwtDecoderState, IndentOption } from "./types";
import { decodeJwt } from "./engine";
import { MAX_INPUT_CHARS, SAMPLE_JWT } from "./constants";

/** As-you-type decode (main thread — JWT decode is bounded and fast, so no
 *  worker). Updates the input status bar only; the output readout changes on
 *  the explicit Decode action so typing never churns it. */
export function handleInput(store: Store<JwtDecoderState>, text: string): void {
    const state = store.get();
    if (!text.trim()) {
        store.set({
            ...state,
            tokenInput: text,
            result: null,
            inputStatus: "empty",
            outputStatus: "empty",
            error: null,
        });
        return;
    }
    if (text.length > MAX_INPUT_CHARS) {
        store.set({
            ...state,
            tokenInput: text,
            result: null,
            inputStatus: "ready",
            outputStatus: "empty",
            error: "Input too large (" + text.length.toLocaleString() + " chars).",
        });
        return;
    }
    const live = decodeJwt(text, state.indent);
    live.authoritative = false;
    store.set({ ...state, tokenInput: text, result: live, inputStatus: "ready", error: null });
}

/** The explicit Decode — stamps authoritative, drives the output + announce. */
export function decode(store: Store<JwtDecoderState>): void {
    const state = store.get();
    if (!state.tokenInput.trim()) {
        store.update((s) => ({ ...s, error: "Paste or load a token first." }));
        return;
    }
    const result = decodeJwt(state.tokenInput, state.indent);
    result.authoritative = true;
    store.update((s) => ({
        ...s,
        result,
        inputStatus: "ready",
        outputStatus: result.ok ? "valid" : "invalid",
        error: null,
    }));
}

export function loadSample(store: Store<JwtDecoderState>): void {
    // Load only — never auto-run. The user clicks Decode explicitly.
    handleInput(store, SAMPLE_JWT);
}

export function clearAll(store: Store<JwtDecoderState>): void {
    store.update((s) => ({
        ...s,
        tokenInput: "",
        result: null,
        inputStatus: "empty",
        outputStatus: "empty",
        error: null,
    }));
}

export function setIndent(store: Store<JwtDecoderState>, value: IndentOption): void {
    store.update((s) => ({ ...s, indent: value }));
}
/**
 * JSON→CSV Tool — Singleton Store
 *
 * Exports a single store instance for the JSON-to-CSV tool page.
 * Uses shallow equality to avoid unnecessary re-renders when only
 * reference changes.
 */

import { Store } from "../../state/toolStore";
import type { JsonToCsvState } from "./types";
import { DEFAULT_STATE } from "./types";

/**
 * Shallow equality for JsonToCsvState.
 * Compares top-level keys by reference (fast for primitive values).
 */
function stateEquals(a: JsonToCsvState, b: JsonToCsvState): boolean {
    if (a === b) return true;
    const aKeys = Object.keys(a) as (keyof JsonToCsvState)[];
    const bKeys = Object.keys(b) as (keyof JsonToCsvState)[];
    if (aKeys.length !== bKeys.length) return false;
    for (const key of aKeys) {
        if (a[key] !== b[key]) return false;
    }
    return true;
}

export const jsonToCsvStore = new Store<JsonToCsvState>(DEFAULT_STATE, stateEquals);

/** Reset the store to its default/initial state */
export function resetStore(): void {
    jsonToCsvStore.set({ ...DEFAULT_STATE });
}


import { Store } from "../../state/toolStore";
import type { TextDiffState } from "./types";
import { DEFAULT_STATE } from "./types";

function stateEquals(a: TextDiffState, b: TextDiffState): boolean {
    if (a === b) return true;
    const aKeys = Object.keys(a) as (keyof TextDiffState)[];
    const bKeys = Object.keys(b) as (keyof TextDiffState)[];
    if (aKeys.length !== bKeys.length) return false;
    for (const k of aKeys) {
        if (a[k] !== b[k]) return false;
    }
    return true;
}

export const textDiffStore = new Store<TextDiffState>(DEFAULT_STATE, stateEquals);
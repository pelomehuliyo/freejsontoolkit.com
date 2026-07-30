import { Store } from "../../state/toolStore";
import type { JsonDiffState } from "./types";
import { DEFAULT_STATE } from "./types";

function stateEquals(a: JsonDiffState, b: JsonDiffState): boolean {
    if (a === b) return true;
    const aKeys = Object.keys(a) as (keyof JsonDiffState)[];
    const bKeys = Object.keys(b) as (keyof JsonDiffState)[];
    if (aKeys.length !== bKeys.length) return false;
    for (const k of aKeys) {
        if (a[k] !== b[k]) return false;
    }
    return true;
}

export const jsonDiffStore = new Store<JsonDiffState>(DEFAULT_STATE, stateEquals);